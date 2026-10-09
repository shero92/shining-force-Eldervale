import ctypes as C
import sys,json
from pathlib import Path
import numpy as np
from PIL import Image

class GameInfo(C.Structure):
    _fields_=[('path',C.c_char_p),('data',C.c_void_p),('size',C.c_size_t),('meta',C.c_char_p)]
ENV=C.CFUNCTYPE(C.c_bool,C.c_uint,C.c_void_p)
VIDEO=C.CFUNCTYPE(None,C.c_void_p,C.c_uint,C.c_uint,C.c_size_t)
AUDIO=C.CFUNCTYPE(None,C.c_int16,C.c_int16)
BATCH=C.CFUNCTYPE(C.c_size_t,C.POINTER(C.c_int16),C.c_size_t)
POLL=C.CFUNCTYPE(None)
INPUT=C.CFUNCTYPE(C.c_int16,C.c_uint,C.c_uint,C.c_uint,C.c_uint)

class Emulator:
    def __init__(self,rom,core):
        self.core=C.CDLL(str(Path(core)))
        self.format=0; self.frame=None; self.keys=set(); self.frames=0; self.audio_samples=0; self.audio_peak=0
        self.folder=str(Path('rom-qa-data').resolve()).encode();Path(self.folder.decode()).mkdir(exist_ok=True)
        self.envcb=ENV(self.environment)
        self.vidcb=VIDEO(self.video)
        self.audcb=AUDIO(lambda l,r:None)
        self.batcb=BATCH(self.audio)
        self.pollcb=POLL(lambda:None)
        self.incb=INPUT(lambda port,dev,index,key: int(port==0 and key in self.keys))
        for name,cb in [('environment',self.envcb),('video_refresh',self.vidcb),('audio_sample',self.audcb),('audio_sample_batch',self.batcb),('input_poll',self.pollcb),('input_state',self.incb)]:
            getattr(self.core,'retro_set_'+name)(cb)
        self.core.retro_init()
        self.core.retro_load_game.argtypes=[C.POINTER(GameInfo)];self.core.retro_load_game.restype=C.c_bool
        data=Path(rom).read_bytes();self.buf=C.create_string_buffer(data)
        self.info=GameInfo(str(Path(rom).resolve()).encode(),C.cast(self.buf,C.c_void_p),len(data),None)
        assert self.core.retro_load_game(C.byref(self.info))
        self.core.retro_set_controller_port_device(0,1)
        self.core.retro_get_memory_data.argtypes=[C.c_uint];self.core.retro_get_memory_data.restype=C.c_void_p
        self.core.retro_get_memory_size.argtypes=[C.c_uint];self.core.retro_get_memory_size.restype=C.c_size_t
        self.core.retro_serialize_size.restype=C.c_size_t
        self.core.retro_serialize.argtypes=[C.c_void_p,C.c_size_t]; self.core.retro_serialize.restype=C.c_bool
        self.core.retro_unserialize.argtypes=[C.c_void_p,C.c_size_t]; self.core.retro_unserialize.restype=C.c_bool
    def environment(self,cmd,data):
        if cmd in (9,30,31): C.cast(data,C.POINTER(C.c_char_p))[0]=self.folder;return True
        if cmd==10:self.format=C.cast(data,C.POINTER(C.c_int))[0];return True
        if cmd==3:C.cast(data,C.POINTER(C.c_bool))[0]=False;return True
        if cmd==17:C.cast(data,C.POINTER(C.c_bool))[0]=False;return True
        if cmd in (1,11,16,18,35,37):return True
        if cmd==15:
            class Var(C.Structure):_fields_=[('key',C.c_char_p),('value',C.c_char_p)]
            C.cast(data,C.POINTER(Var)).contents.value=None;return False
        return False
    def audio(self,data,count):
        a=np.ctypeslib.as_array(data,shape=(count*2,))
        self.audio_peak=max(self.audio_peak,int(np.max(np.abs(a.astype(np.int32)))))
        self.audio_samples+=count
        return count
    def video(self,data,w,h,pitch):
        if not data:return
        raw=C.string_at(data,h*pitch)
        if self.format==1:
            a=np.frombuffer(raw,dtype=np.uint32).reshape(h,pitch//4)[:,:w]
            rgb=np.stack([(a>>16)&255,(a>>8)&255,a&255],axis=-1)
        else:
            a=np.frombuffer(raw,dtype=np.uint16).reshape(h,pitch//2)[:,:w]
            if self.format==2:rgb=np.stack([((a>>11)&31)*255//31,((a>>5)&63)*255//63,(a&31)*255//31],axis=-1)
            else:rgb=np.stack([((a>>10)&31)*255//31,((a>>5)&31)*255//31,(a&31)*255//31],axis=-1)
        self.frame=rgb.astype(np.uint8)
    def run(self,n,keys=()):
        self.keys=set(keys)
        for _ in range(n):self.core.retro_run();self.frames+=1
    def shot(self,path):
        Image.fromarray(self.frame).resize((self.frame.shape[1]*3,self.frame.shape[0]*3),Image.Resampling.NEAREST).save(path)
    def save(self,path):
        n=self.core.retro_serialize_size();b=C.create_string_buffer(n)
        assert self.core.retro_serialize(b,n);Path(path).write_bytes(b.raw)
        size=self.core.retro_get_memory_size(0)
        Path(str(path)+'.sram').write_bytes(C.string_at(self.core.retro_get_memory_data(0),size))
    def load(self,path):
        b=Path(path).read_bytes();buf=C.create_string_buffer(b)
        assert self.core.retro_unserialize(buf,len(b))
        sram=Path(str(path)+'.sram')
        if sram.exists():
            data=sram.read_bytes();assert len(data)==self.core.retro_get_memory_size(0)
            C.memmove(self.core.retro_get_memory_data(0),data,len(data))


if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser(description='Native ROM emulator input driver; requires numpy, Pillow and a Genesis Plus GX libretro core.')
    parser.add_argument('--rom',required=True)
    parser.add_argument('--core',required=True)
    parser.add_argument('--output',required=True)
    parser.add_argument('--load-state')
    parser.add_argument('--clear-sram',action='store_true')
    parser.add_argument('--actions',required=True,help='JSON list of [frames, libretro buttons] actions')
    args=parser.parse_args()
    e=Emulator(args.rom,args.core)
    if args.clear_sram:
        C.memset(e.core.retro_get_memory_data(0),0,e.core.retro_get_memory_size(0))
    if args.load_state:e.load(args.load_state)
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    for i,action in enumerate(json.loads(args.actions)):
        e.run(*action);e.shot(out/f'{i:02}.png')
    e.save(out/'state.bin')
    e.core.m68k_get_reg.restype=C.c_uint
    pc=e.core.m68k_get_reg(16)
    print(json.dumps({'frames':e.frames,'audio_samples':e.audio_samples,'audio_peak':e.audio_peak,'pc':hex(pc)}))
    if 0x760<=pc<0x770:raise SystemExit('ROM entered the fatal exception handler')

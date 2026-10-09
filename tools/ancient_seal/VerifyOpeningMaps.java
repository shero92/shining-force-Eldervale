// ROM-free compatibility test using decoders already shipped with SF2MapCreator.
import java.nio.file.*;
import java.lang.reflect.*;
import com.sfc.sf2.graphics.*;
import com.sfc.sf2.graphics.compressed.*;
import com.sfc.sf2.palette.*;
import com.sfc.sf2.map.block.*;
import com.sfc.sf2.map.layout.*;
class VerifyOpeningMaps {
 public static void main(String[] args) throws Exception {
  String dir=args[0]; java.awt.Color[] colors=new java.awt.Color[16]; for(int i=0;i<16;i++) colors[i]=new java.awt.Color(i*16,i*16,i*16);
  Palette p=new Palette(colors);
  Tile[] tiles=new StackGraphicsDecoder().decodeStackGraphics(Files.readAllBytes(Path.of(dir,"tiles.bin")),p);
  byte[] expected=Files.readAllBytes(Path.of(dir,"tiles-expected.bin")); int offset=0;
  for(Tile t:tiles)for(int y=0;y<8;y++)for(int x=0;x<8;x+=2) if((byte)((t.getPixels()[x][y]<<4)|t.getPixels()[x+1][y])!=expected[offset++])throw new AssertionError("Tile pixel mismatch at "+offset);
  if(offset!=expected.length)throw new AssertionError("Tile count: "+offset);
  System.out.println("PASS: existing SF2 StackGraphicsDecoder reproduced all original tile bytes");
  var bm=new com.sfc.sf2.map.block.io.DisassemblyManager();
  String[] paths={dir+"/tiles0.bin",dir+"/tiles1.bin",dir+"/tiles2.bin",dir+"/tiles0.bin",dir+"/tiles0.bin"};
  MapBlock[] blocks=bm.importDisassembly(dir+"/palette.bin",paths,dir+"/blocks.bin");
  byte[] blockWords=Files.readAllBytes(Path.of(dir,"blocks-expected.bin"));
  if(blocks.length!=blockWords.length/18+3)throw new AssertionError("Block count "+blocks.length);
  for(int i=3;i<blocks.length;i++)for(int j=0;j<9;j++) {
   int k=((i-3)*9+j)*2;
   int tileId=(((blockWords[k]&255)<<8)|(blockWords[k+1]&255))-256;
   if(blocks[i].getTiles()[j].getId()!=tileId)throw new AssertionError("Block tile id mismatch "+i+","+j);
  }
  System.out.println("PASS: existing SF2 map block decoder reproduced "+(blocks.length-3)+" original blocks");
  for(String n:new String[]{"Sanctuary","Stormwatch","BoneTide"}) {
   var lm=new com.sfc.sf2.map.layout.io.DisassemblyManager();
   Method m=lm.getClass().getDeclaredMethod("parseLayoutData",MapBlock[].class,String.class);m.setAccessible(true);
   MapLayout layout=(MapLayout)m.invoke(lm,blocks,dir+"/"+n+".bin");
   byte[] exp=Files.readAllBytes(Path.of(dir,n+"-expected.bin"));
   if(layout.getBlocks().length!=4096)throw new AssertionError("Layout count");
   for(int i=0;i<4096;i++) { int word=((exp[i*2]&255)<<8)|(exp[i*2+1]&255); var b=layout.getBlocks()[i]; if((b.getIndex()|b.getFlags())!=word)throw new AssertionError(n+" layout mismatch at "+i+" got "+(b.getIndex()|b.getFlags())+" expected "+word); }
   System.out.println("PASS: existing SF2 layout decoder reproduced all 4096 "+n+" block/flag words");
  }
 }
}

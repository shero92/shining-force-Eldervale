import java.nio.file.*;
import java.util.Arrays;
import com.sfc.sf2.graphics.Tile;
import com.sfc.sf2.graphics.compression.BasicGraphicsDecoder;

// Existing SF2MapSpriteManager decoder, independent of the JS encoder.
class VerifyCharacterSprites {
    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]);
        for (String name : new String[]{"Hero-Up", "Hero-Side", "Hero-Down",
                                       "Elder-Up", "Elder-Side", "Elder-Down"}) {
            byte[] expected = Files.readAllBytes(root.resolve(name + "-expected.bin"));
            Tile[] tiles = new BasicGraphicsDecoder().decode(Files.readAllBytes(root.resolve(name + ".bin")), null);
            if (tiles.length != 18) throw new AssertionError(name + ": expected 18 tiles");
            byte[] actual = new byte[576];
            for (int t = 0; t < tiles.length; t++) {
                byte[] pixels = tiles[t].getPixels();
                for (int p = 0; p < 32; p++)
                    actual[t * 32 + p] = (byte)((pixels[p * 2] << 4) | pixels[p * 2 + 1]);
            }
            if (!Arrays.equals(expected, actual)) throw new AssertionError(name + ": native decoder mismatch");
            System.out.println("PASS: SF2MapSpriteManager decoded " + name + " (576 bytes / 18 tiles)");
        }
    }
}

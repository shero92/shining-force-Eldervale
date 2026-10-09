; Ancient Seal original opening map definitions, STANDARD_BUILD only.
; Reserve native map slots 43, 45 and 50; original data remains available to vanilla.
AncientSeal_Sanctuary_Map:
                mapPalette 16
                mapTileset1 115
                mapTileset2 116
                mapTileset3 117
                mapTileset4 255
                mapTileset5 255
                dc.l AncientSeal_OpeningBlocks, AncientSeal_Sanctuary_Layout
                dc.l AncientSeal_Sanctuary_Areas, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_EmptyMapEvents, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_Sanctuary_Warps, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_EmptyMapEvents, $FFFFFFFF
AncientSeal_Stormwatch_Map:
                mapPalette 16
                mapTileset1 115
                mapTileset2 116
                mapTileset3 117
                mapTileset4 255
                mapTileset5 255
                dc.l AncientSeal_OpeningBlocks, AncientSeal_Stormwatch_Layout
                dc.l AncientSeal_Stormwatch_Areas, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_EmptyMapEvents, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_Stormwatch_Warps, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_EmptyMapEvents, $FFFFFFFF
AncientSeal_BoneTide_Map:
                mapPalette 16
                mapTileset1 115
                mapTileset2 116
                mapTileset3 117
                mapTileset4 255
                mapTileset5 255
                dc.l AncientSeal_OpeningBlocks, AncientSeal_BoneTide_Layout
                dc.l AncientSeal_BoneTide_Areas, AncientSeal_BoneTide_FlagEvents
                dc.l AncientSeal_EmptyMapEvents, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_BoneTide_Warps, AncientSeal_EmptyMapEvents
                dc.l AncientSeal_EmptyMapEvents, $FFFFFFFF
AncientSeal_Sanctuary_Areas:
                mainLayerStart 0, 1
                mainLayerEnd 31, 23
                scndLayerFgndStart 0, 32
                scndLayerBgndStart 0, 0
                mainLayerParallax 256, 256
                scndLayerParallax 256, 256
                mainLayerAutoscroll 0, 0
                scndLayerAutoscroll 0, 0
                mainLayerType 0
                areaDefaultMusic MUSIC_TOWN
                endWord
AncientSeal_Stormwatch_Areas:
                mainLayerStart 0, 1
                mainLayerEnd 39, 19
                scndLayerFgndStart 0, 32
                scndLayerBgndStart 0, 0
                mainLayerParallax 256, 256
                scndLayerParallax 256, 256
                mainLayerAutoscroll 0, 0
                scndLayerAutoscroll 0, 0
                mainLayerType 0
                areaDefaultMusic MUSIC_ELVEN_TOWN
                endWord
AncientSeal_BoneTide_Areas:
                mainLayerStart 0, 1
                mainLayerEnd 37, 19
                scndLayerFgndStart 0, 32
                scndLayerBgndStart 0, 0
                mainLayerParallax 256, 256
                scndLayerParallax 256, 256
                mainLayerAutoscroll 0, 0
                scndLayerAutoscroll 0, 0
                mainLayerType 0
                areaDefaultMusic MUSIC_ELVEN_TOWN
                endWord
AncientSeal_Sanctuary_Warps:
                mWarp 31, 15
                  warpNoScroll
                  warpMap MAP_ANCIENT_SEAL_STORMWATCH
                  warpDest 2, 10
                  warpFacing RIGHT
                endWord
AncientSeal_Stormwatch_Warps:
                mWarp 0, 10
                  warpNoScroll
                  warpMap MAP_ANCIENT_SEAL_SANCTUARY
                  warpDest 29, 15
                  warpFacing LEFT
                mWarp 39, 10
                  warpNoScroll
                  warpMap MAP_ANCIENT_SEAL_BONE_TIDE_SHORE
                  warpDest 2, 10
                  warpFacing RIGHT
                endWord
AncientSeal_BoneTide_Warps:
                mWarp 0, 10
                  warpNoScroll
                  warpMap MAP_ANCIENT_SEAL_STORMWATCH
                  warpDest 37, 10
                  warpFacing LEFT
                endWord
AncientSeal_BoneTide_FlagEvents:
                fbcFlag ANCIENT_SEAL_SWORD_FOUND
                  fbcSource 20, 10
                  fbcSize   1, 1
                  fbcDest   22, 10
                endWord
AncientSeal_EmptyMapEvents:
                endWord
                include "data/maps/ancientseal/opening-generated.asm"

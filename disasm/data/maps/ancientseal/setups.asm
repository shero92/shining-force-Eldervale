; Persistent flags 912..917 audited against flag catalog and native flag uses.
; ChurchMenu uses the existing SRAM/egress system; no replacement save format.
AncientSeal_Sanctuary_Setup:
                dc.l AncientSeal_Sanctuary_Entities, AncientSeal_Sanctuary_EntityEvents
                dc.l AncientSeal_DefaultZoneEvents, AncientSeal_NoDescription
                dc.l AncientSeal_DefaultItemEvents, AncientSeal_Sanctuary_Init
AncientSeal_Stormwatch_Setup:
                dc.l AncientSeal_NoEntities, AncientSeal_DefaultEntityEvents
                dc.l AncientSeal_Stormwatch_ZoneEvents, AncientSeal_NoDescription
                dc.l AncientSeal_DefaultItemEvents, AncientSeal_Stormwatch_Init
AncientSeal_BoneTide_Setup:
                dc.l AncientSeal_NoEntities, AncientSeal_DefaultEntityEvents
                dc.l AncientSeal_BoneTide_ZoneEvents, AncientSeal_BoneTide_Descriptions
                dc.l AncientSeal_DefaultItemEvents, AncientSeal_BoneTide_Init
AncientSeal_Sanctuary_Entities:
                msFixedEntity 12, 10, DOWN, MAPSPRITE_ANCIENT_SEAL_FATHER, eas_Init
                msEntitiesEnd
AncientSeal_NoEntities:
                msEntitiesEnd
AncientSeal_Sanctuary_EntityEvents:
                msEntityEvent 128, DOWN, AncientSeal_FatherTalk-AncientSeal_Sanctuary_EntityEvents
                msDefaultEntityEvent AncientSeal_NoEvent-AncientSeal_Sanctuary_EntityEvents
AncientSeal_DefaultEntityEvents:
                msDefaultEntityEvent AncientSeal_NoEvent-AncientSeal_DefaultEntityEvents
AncientSeal_DefaultZoneEvents:
                msDefaultZoneEvent AncientSeal_NoEvent-AncientSeal_DefaultZoneEvents
AncientSeal_Stormwatch_ZoneEvents:
                msZoneEvent 15, 255, AncientSeal_StormEvent-AncientSeal_Stormwatch_ZoneEvents
                msDefaultZoneEvent AncientSeal_NoEvent-AncientSeal_Stormwatch_ZoneEvents
AncientSeal_BoneTide_ZoneEvents:
                msZoneEvent 3, 255, AncientSeal_ShoreArrival-AncientSeal_BoneTide_ZoneEvents
                msZoneEvent 35, 255, AncientSeal_RuinsPending-AncientSeal_BoneTide_ZoneEvents
                msDefaultZoneEvent AncientSeal_NoEvent-AncientSeal_BoneTide_ZoneEvents
AncientSeal_DefaultItemEvents:
                msDefaultItemEvent AncientSeal_NoEvent-AncientSeal_DefaultItemEvents
AncientSeal_NoDescription:
                moveq   #0,d7
AncientSeal_NoEvent:
                rts
AncientSeal_Sanctuary_Init:
                setSavedByte #MAP_ANCIENT_SEAL_SANCTUARY, EGRESS_MAP
                rts
AncientSeal_Stormwatch_Init:
                setSavedByte #MAP_ANCIENT_SEAL_SANCTUARY, EGRESS_MAP
                rts
AncientSeal_BoneTide_Init:
                setSavedByte #MAP_ANCIENT_SEAL_SANCTUARY, EGRESS_MAP
                rts
AncientSeal_FatherTalk:
                chkFlg ANCIENT_SEAL_WAKE_COMPLETE
                bne.w AncientSeal_FatherServices
                txt ANCIENT_SEAL_TEXT_WELCOME
                txt ANCIENT_SEAL_TEXT_GUIDANCE
                txt ANCIENT_SEAL_TEXT_CARE
                setFlg ANCIENT_SEAL_WAKE_COMPLETE
                rts
AncientSeal_FatherServices:
                txt ANCIENT_SEAL_TEXT_REPEAT
                jsr j_ChurchMenu
                rts
AncientSeal_StormEvent:
                chkFlg ANCIENT_SEAL_STORM_SEEN
                bne.s AncientSeal_NoStormRepeat
                txt ANCIENT_SEAL_TEXT_STORM
                txt ANCIENT_SEAL_TEXT_STORM_WARNING
                setFlg ANCIENT_SEAL_STORM_SEEN
AncientSeal_NoStormRepeat:
                rts
AncientSeal_ShoreArrival:
                chkFlg ANCIENT_SEAL_SWORD_FOUND
                bne.s AncientSeal_NoShoreArrivalRepeat
                txt ANCIENT_SEAL_TEXT_SHORE_ARRIVAL
AncientSeal_NoShoreArrivalRepeat:
                rts
AncientSeal_RuinsPending:
                txt ANCIENT_SEAL_TEXT_RUINS_PENDING
                rts
AncientSeal_BoneTide_Descriptions:
                move.w  #ANCIENT_SEAL_TEXT_SWORD_GONE,d3
                lea     AncientSeal_BoneTide_DescriptionTable(pc),a0
                nop
                jmp     DisplayAreaDescription
AncientSeal_BoneTide_DescriptionTable:
                msDescFunction 22, 10, AncientSeal_SwordInspect-AncientSeal_BoneTide_DescriptionTable
                msDescEnd
AncientSeal_SwordInspect:
                chkFlg ANCIENT_SEAL_SWORD_FOUND
                bne.w AncientSeal_SwordAlreadyTaken
                txt ANCIENT_SEAL_TEXT_SWORD_WAITING
                move.w  #ITEM_ANCIENT_SEAL_SWORD,d0
                moveq   #1,d1
                jsr     ReceiveMandatoryItem
                cmpi.w  #1,d0
                beq.w AncientSeal_SwordPickupAborted
                txt ANCIENT_SEAL_TEXT_VISION_FIRE
                txt ANCIENT_SEAL_TEXT_VISION_GATE
                txt ANCIENT_SEAL_TEXT_VISION_SEAL
                txt ANCIENT_SEAL_TEXT_VISION_HEIRS
                txt ANCIENT_SEAL_TEXT_VISION_END
                setFlg ANCIENT_SEAL_SWORD_FOUND
                script  AncientSeal_RemoveSwordScript
AncientSeal_SwordPickupAborted:
                rts
AncientSeal_SwordAlreadyTaken:
                txt ANCIENT_SEAL_TEXT_SWORD_GONE
                rts
AncientSeal_RemoveSwordScript:
                setBlocks 20,10,1,1,22,10
                csc_end
                include "data/maps/ancientseal/dialogue-generated.asm"

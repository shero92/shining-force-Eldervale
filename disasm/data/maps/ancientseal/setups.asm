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
                msZoneEvent 37, 255, AncientSeal_ShorePending-AncientSeal_Stormwatch_ZoneEvents
                msDefaultZoneEvent AncientSeal_NoEvent-AncientSeal_Stormwatch_ZoneEvents
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
AncientSeal_ShorePending:
                txt ANCIENT_SEAL_TEXT_SHORE_PENDING
                rts
                include "data/maps/ancientseal/dialogue-generated.asm"

"""
ForeSite - SIF Precursor Knowledge Base
Industrial safety precursor catalog based on OSHA, Campbell Institute, and SIF mitigation frameworks.
Used for semantic vector comparison and rule-based fallback classification.
"""

PRECURSOR_KB = [
    # 1. Electrical Hazards
    {
        "id": "PRE-ELEC-01",
        "label": "Energized Equipment Exposure",
        "description": "Worker or equipment is in contact with or near energized electrical parts or bare conductors without proper isolation or barricading.",
        "hazard_category": "Electrocution",
        "base_weight": 0.88,
        "keywords": ["bare wire", "exposed wiring", "naked cable", "energized", "live wire", "conductor", "copper wiring", "electric shock"]
    },
    {
        "id": "PRE-ELEC-02",
        "label": "Inadequate Isolation/Lockout",
        "description": "Lack of lockout tagout LOTO procedures, energy isolation missing before repair, maintenance, or cleaning of electrical or mechanical machinery.",
        "hazard_category": "Arc Flash",
        "base_weight": 0.85,
        "keywords": ["lockout", "tagout", "loto", "breaker not locked", "isolation", "de-energize", "unlocked breaker"]
    },
    {
        "id": "PRE-ELEC-03",
        "label": "Proximity to Electrical Hazard",
        "description": "Electrical components, panels, or junction boxes exposed to water, damp floors, or conductive fluids creating immediate short circuit or electrocution risk.",
        "hazard_category": "Electrocution",
        "base_weight": 0.86,
        "keywords": ["water near electrical", "wet floor wire", "water pump wire", "submerged cable", "liquid near panel"]
    },
    {
        "id": "PRE-ELEC-04",
        "label": "Overhead Power Line Contact Risk",
        "description": "Cranes, booms, scaffolding, or elevated platforms operating within unsafe approach boundary of overhead high-voltage power lines.",
        "hazard_category": "Electrocution",
        "base_weight": 0.92,
        "keywords": ["overhead line", "powerline", "high voltage", "boom near line", "crane powerline"]
    },

    # 2. Falls from Height
    {
        "id": "PRE-FALL-01",
        "label": "Working at Height Without Protection",
        "description": "Worker elevated above 1.8 meters or 6 feet on roof, beam, edge, or ladder without personal fall arrest system, harness, lanyard, or guardrails.",
        "hazard_category": "Fall from Height",
        "base_weight": 0.90,
        "keywords": ["working at height", "no harness", "no lanyard", "elevated", "fall risk", "no safety belt", "unprotected edge"]
    },
    {
        "id": "PRE-FALL-02",
        "label": "Unsecured or Damaged Scaffolding",
        "description": "Scaffolding missing toe boards, cross bracing, base plates, tie-ins, or planks improperly secured, overloaded, or uninspected.",
        "hazard_category": "Structural Collapse",
        "base_weight": 0.84,
        "keywords": ["scaffold", "scaffolding", "loose plank", "scaffold sway", "missing guardrail", "unsecured platform"]
    },
    {
        "id": "PRE-FALL-03",
        "label": "Uncovered Floor Openings and Shafts",
        "description": "Uncovered or unmarked floor holes, elevator shafts, roof penetrations, or skylights lacking load-bearing covers or sturdy barricades.",
        "hazard_category": "Fall from Height",
        "base_weight": 0.86,
        "keywords": ["floor opening", "hole in floor", "open shaft", "uncovered hole", "skylight opening", "penetration"]
    },
    {
        "id": "PRE-FALL-04",
        "label": "Improper Ladder Usage",
        "description": "Damaged ladders, metal ladders near live conductors, untied ladders, or workers overreaching and standing on the top rungs.",
        "hazard_category": "Fall from Height",
        "base_weight": 0.72,
        "keywords": ["ladder", "broken rung", "unsecured ladder", "overreaching", "top rung"]
    },

    # 3. Confined Space
    {
        "id": "PRE-CONF-01",
        "label": "Confined Space Entry Without Permit",
        "description": "Worker entering manhole, vessel, tank, silo, vault, or trench without atmospheric testing, entry permit, continuous ventilation, or standby rescue attendant.",
        "hazard_category": "Asphyxiation",
        "base_weight": 0.93,
        "keywords": ["confined space", "manhole", "storage tank", "silo", "no permit", "attendant missing", "vessel entry"]
    },
    {
        "id": "PRE-CONF-02",
        "label": "Hazardous Atmosphere Accumulation",
        "description": "Oxygen deficiency below 19.5% or enrichment above 23.5%, toxic gas presence like hydrogen sulfide, carbon monoxide, or methane without gas detector.",
        "hazard_category": "Toxic Exposure",
        "base_weight": 0.95,
        "keywords": ["toxic gas", "h2s", "carbon monoxide", "gas leak", "oxygen deficient", "fumes", "no detector", "suffocation"]
    },

    # 4. Mobile Equipment & Struck-By
    {
        "id": "PRE-STRK-01",
        "label": "Struck-By Moving Equipment",
        "description": "Worker on foot working in traffic zone, blind spot, or travel path of forklifts, dump trucks, excavators, or loaders without high-visibility gear or physical segregation.",
        "hazard_category": "Struck-By",
        "base_weight": 0.85,
        "keywords": ["forklift", "truck", "loader", "pedestrian", "blind spot", "heavy machinery", "traffic path", "struck by"]
    },
    {
        "id": "PRE-STRK-02",
        "label": "Suspended Load Line of Fire",
        "description": "Workers standing or walking directly underneath crane hooks, suspended loads, rigging cables, or hoisted precast concrete and steel beams.",
        "hazard_category": "Crush Injury",
        "base_weight": 0.90,
        "keywords": ["suspended load", "under hook", "rigging", "crane lift", "overhead hoist", "hoisted load", "falling object"]
    },
    {
        "id": "PRE-STRK-03",
        "label": "Unsecured Cargo and Unstable Stacks",
        "description": "Heavy industrial materials, pipes, drums, or pallets stacked unevenly, unchocked, or exceeding safe height limits risking toppling over onto personnel.",
        "hazard_category": "Crush Injury",
        "base_weight": 0.78,
        "keywords": ["unstable stack", "falling pallet", "tilted drums", "pipe roll", "collapse stack", "tip over"]
    },

    # 5. Machine Guarding & Caught-Between
    {
        "id": "PRE-MECH-01",
        "label": "Bypassed Safety Device",
        "description": "Physical safety guards, interlocks, emergency stop buttons, light curtains, or protective enclosures removed, disabled, or bypassed on operating machines.",
        "hazard_category": "Caught-In/Between",
        "base_weight": 0.89,
        "keywords": ["bypassed interlock", "removed guard", "machine guard missing", "disabled sensor", "e-stop broken"]
    },
    {
        "id": "PRE-MECH-02",
        "label": "Rotating Parts and Nip Point Exposure",
        "description": "Exposed rotating shafts, conveyor belts, rollers, gears, pulleys, or drive chains without safety covers creating catastrophic entanglement risk.",
        "hazard_category": "Amputation",
        "base_weight": 0.87,
        "keywords": ["nip point", "pinch point", "conveyor", "rotating shaft", "gears exposed", "pulley", "entanglement", "amputation"]
    },

    # 6. Pressure & Stored Energy
    {
        "id": "PRE-PRES-01",
        "label": "Uncontrolled Stored Energy Release",
        "description": "Hydraulic systems, pneumatic lines, steam pipes, or pressurized vessels serviced without relieving residual pressure, bleeding lines, or blocking mechanisms.",
        "hazard_category": "Explosion",
        "base_weight": 0.88,
        "keywords": ["hydraulic pressure", "pneumatic line", "steam leak", "pressurized pipe", "bleeder valve", "burst pipe"]
    },
    {
        "id": "PRE-PRES-02",
        "label": "Damaged Compressed Gas Cylinders",
        "description": "High pressure gas cylinders unchained, missing valve protection caps, damaged regulator, or stored in close proximity to sparks or incompatible chemicals.",
        "hazard_category": "Explosion",
        "base_weight": 0.82,
        "keywords": ["gas cylinder", "oxygen tank", "acetylene", "unsecured cylinder", "missing cap", "tank regulator"]
    },

    # 7. Chemical & Toxic Hazards
    {
        "id": "PRE-CHEM-01",
        "label": "Chemical Exposure Without PPE",
        "description": "Handling corrosive acids, solvents, caustic liquids, or toxic reagents without chemical gloves, goggles, face shield, or emergency wash stations available.",
        "hazard_category": "Chemical Burn",
        "base_weight": 0.80,
        "keywords": ["chemical spill", "acid splash", "solvent", "corrosive", "no chemical gloves", "caustic", "toxic leak"]
    },
    {
        "id": "PRE-CHEM-02",
        "label": "Flammable Vapor and Hot Work Hazard",
        "description": "Welding, cutting, or spark-producing operations conducted near fuel storage, solvent tanks, or unventilated flammable vapor zones without hot work permits.",
        "hazard_category": "Fire & Explosion",
        "base_weight": 0.91,
        "keywords": ["hot work", "welding near fuel", "sparks near solvent", "flammable vapors", "fire hazard", "no extinguisher"]
    },

    # 8. Trenching & Excavation
    {
        "id": "PRE-EXCV-01",
        "label": "Unprotected Trench and Cave-In Hazard",
        "description": "Excavation or trench deeper than 1.5 meters (5 feet) without trench box, shoring, benching, or sloping, with workers inside and spoil pile right at edge.",
        "hazard_category": "Cave-In",
        "base_weight": 0.94,
        "keywords": ["trench collapse", "cave-in", "excavation", "no shoring", "trench box missing", "spoil pile edge", "ditch collapse"]
    },

    # 9. Environmental & Structural
    {
        "id": "PRE-STRC-01",
        "label": "Structural Instability and Collapse Hazard",
        "description": "Weakened load-bearing walls, damaged structural columns, excessive floor load, corroded steel trusses, or cracking ceiling foundations.",
        "hazard_category": "Structural Collapse",
        "base_weight": 0.89,
        "keywords": ["cracked pillar", "wall crack", "sagging roof", "structural collapse", "damaged beam", "foundation sink"]
    },
    {
        "id": "PRE-ENV-01",
        "label": "Slippery Walkways and Minor Trip Hazards",
        "description": "Accumulation of light debris, tools, power cords across walkways, or wet floor without caution signs resulting in slips or minor falls on same level.",
        "hazard_category": "Slip and Trip",
        "base_weight": 0.35,
        "keywords": ["slip", "trip", "wet floor sign missing", "cluttered aisle", "extension cord across floor", "puddle"]
    },
    {
        "id": "PRE-ENV-02",
        "label": "Inadequate Workplace Illumination",
        "description": "Burnt-out light fixtures, dim corridors, or unlit stairwells impairing worker visibility in hazardous operational zones.",
        "hazard_category": "Visibility Hazard",
        "base_weight": 0.40,
        "keywords": ["dim lighting", "dark stairwell", "lights out", "poor visibility", "flickering bulb"]
    }
]

# Quick mapping by category for fast grouping
HAZARD_CATEGORIES = [
    "Electrocution",
    "Arc Flash",
    "Burns",
    "Fall from Height",
    "Crush Injury",
    "Caught-In/Between",
    "Amputation",
    "Asphyxiation",
    "Toxic Exposure",
    "Chemical Burn",
    "Fire & Explosion",
    "Cave-In",
    "Structural Collapse",
    "Struck-By",
    "Slip and Trip",
    "Visibility Hazard"
]

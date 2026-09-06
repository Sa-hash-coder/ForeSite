"""
ForeSite - SIF Precursor Knowledge Base
Industrial safety precursor catalog based on OSHA, Campbell Institute, and SIF mitigation frameworks.
Used for semantic vector comparison, rule-based fallback classification, and corrective action suggestions.
"""

PRECURSOR_KB = [
    # 1. Electrical Hazards
    {
        "id": "PRE-ELEC-01",
        "label": "Energized Equipment Exposure",
        "description": "Worker or equipment is in contact with or near energized electrical parts or bare conductors without proper isolation or barricading.",
        "hazard_category": "Electrocution",
        "base_weight": 0.88,
        "keywords": ["bare wire", "exposed wiring", "naked cable", "energized", "live wire", "conductor", "copper wiring", "electric shock"],
        "remediation_steps": [
            "Immediately de-energize and lock out (LOTO) electrical feed at source breaker.",
            "Install red perimeter barricade tape and 'DANGER - HIGH VOLTAGE' warning signage.",
            "Replace damaged cables with IP67-rated insulated industrial conduit before re-energizing."
        ]
    },
    {
        "id": "PRE-ELEC-02",
        "label": "Inadequate Isolation/Lockout",
        "description": "Lack of lockout tagout LOTO procedures, energy isolation missing before repair, maintenance, or cleaning of electrical or mechanical machinery.",
        "hazard_category": "Arc Flash",
        "base_weight": 0.85,
        "keywords": ["lockout", "tagout", "loto", "breaker not locked", "isolation", "de-energize", "unlocked breaker"],
        "remediation_steps": [
            "Halt maintenance work and enforce zero-energy verification (Zero Energy State Protocol).",
            "Apply standardized padlocks and identification tags on primary breaker switch.",
            "Audit team compliance on mandatory LOTO permits prior to resuming service."
        ]
    },
    {
        "id": "PRE-ELEC-03",
        "label": "Proximity to Electrical Hazard",
        "description": "Electrical components, panels, or junction boxes exposed to water, damp floors, or conductive fluids creating immediate short circuit or electrocution risk.",
        "hazard_category": "Electrocution",
        "base_weight": 0.86,
        "keywords": ["water near electrical", "wet floor wire", "water pump wire", "submerged cable", "liquid near panel"],
        "remediation_steps": [
            "Isolate the electrical junction box immediately and cut power to nearby water pumps.",
            "Deploy submersible sump pumps to clear standing liquid and eliminate water ingress.",
            "Relocate junction box or install waterproof NEMA 4X / IP66 protective enclosure."
        ]
    },
    {
        "id": "PRE-ELEC-04",
        "label": "Overhead Power Line Contact Risk",
        "description": "Cranes, booms, scaffolding, or elevated platforms operating within unsafe approach boundary of overhead high-voltage power lines.",
        "hazard_category": "Electrocution",
        "base_weight": 0.92,
        "keywords": ["overhead line", "powerline", "high voltage", "boom near line", "crane powerline"],
        "remediation_steps": [
            "Maintain minimum 10-foot (3-meter) clearance boundary from overhead high-voltage lines.",
            "Designate a dedicated spotter whose sole duty is crane boom clearance monitoring.",
            "Contact local utility provider to install insulating line sleeves or de-energize lines during lifting."
        ]
    },

    # 2. Falls from Height
    {
        "id": "PRE-FALL-01",
        "label": "Working at Height Without Protection",
        "description": "Worker elevated above 1.8 meters or 6 feet on roof, beam, edge, or ladder without personal fall arrest system, harness, lanyard, or guardrails.",
        "hazard_category": "Fall from Height",
        "base_weight": 0.90,
        "keywords": ["working at height", "no harness", "no lanyard", "elevated", "fall risk", "no safety belt", "unprotected edge"],
        "remediation_steps": [
            "Issue a Stop-Work notice until full-body harnesses with dual shock-absorbing lanyards are donned.",
            "Verify certified 5,000-lb rated anchor points or horizontal lifeline installations.",
            "Install temporary perimeter guardrail systems (top rail 42\", mid rail 21\") along open edges."
        ]
    },
    {
        "id": "PRE-FALL-02",
        "label": "Unsecured or Damaged Scaffolding",
        "description": "Scaffolding missing toe boards, cross bracing, base plates, tie-ins, or planks improperly secured, overloaded, or uninspected.",
        "hazard_category": "Structural Collapse",
        "base_weight": 0.84,
        "keywords": ["scaffold", "scaffolding", "loose plank", "scaffold sway", "missing guardrail", "unsecured platform"],
        "remediation_steps": [
            "Red-tag scaffold as 'DO NOT USE' until re-inspected by a certified competent person.",
            "Fasten all wooden/metal planks with cleats and install 4-inch toe boards along work platform.",
            "Verify structural tie-ins to permanent walls and install cross-bracing on all towers."
        ]
    },
    {
        "id": "PRE-FALL-03",
        "label": "Uncovered Floor Openings and Shafts",
        "description": "Uncovered or unmarked floor holes, elevator shafts, roof penetrations, or skylights lacking load-bearing covers or sturdy barricades.",
        "hazard_category": "Fall from Height",
        "base_weight": 0.86,
        "keywords": ["floor opening", "hole in floor", "open shaft", "uncovered hole", "skylight opening", "penetration"],
        "remediation_steps": [
            "Install secure load-bearing plywood/steel cover capable of supporting 2x max worker weight.",
            "Paint cover in high-visibility safety orange with bold stencil 'HOLE - DO NOT REMOVE'.",
            "Fasten cover securely to prevent accidental displacement by foot or cart traffic."
        ]
    },
    {
        "id": "PRE-FALL-04",
        "label": "Improper Ladder Usage",
        "description": "Damaged ladders, metal ladders near live conductors, untied ladders, or workers overreaching and standing on the top rungs.",
        "hazard_category": "Fall from Height",
        "base_weight": 0.72,
        "keywords": ["ladder", "broken rung", "unsecured ladder", "overreaching", "top rung"],
        "remediation_steps": [
            "Remove damaged ladder from service and destroy or tag out immediately.",
            "Secure extension ladder top and base; maintain standard 4:1 slope ratio.",
            "Enforce strict '3-points of contact' rule and prohibit stepping on the top two rungs."
        ]
    },

    # 3. Confined Space
    {
        "id": "PRE-CONF-01",
        "label": "Confined Space Entry Without Permit",
        "description": "Worker entering manhole, vessel, tank, silo, vault, or trench without atmospheric testing, entry permit, continuous ventilation, or standby rescue attendant.",
        "hazard_category": "Asphyxiation",
        "base_weight": 0.93,
        "keywords": ["confined space", "manhole", "storage tank", "silo", "no permit", "attendant missing", "vessel entry"],
        "remediation_steps": [
            "Order immediate evacuation of confined space until Confined Space Entry Permit is authorized.",
            "Perform mandatory 4-gas atmospheric testing (Oxygen, CO, H2S, LEL) at top, middle, and bottom.",
            "Station a dedicated rescue attendant at entry hatch with retrieval winch and tripod system."
        ]
    },
    {
        "id": "PRE-CONF-02",
        "label": "Hazardous Atmosphere Accumulation",
        "description": "Oxygen deficiency below 19.5% or enrichment above 23.5%, toxic gas presence like hydrogen sulfide, carbon monoxide, or methane without gas detector.",
        "hazard_category": "Toxic Exposure",
        "base_weight": 0.95,
        "keywords": ["toxic gas", "h2s", "carbon monoxide", "gas leak", "oxygen deficient", "fumes", "no detector", "suffocation"],
        "remediation_steps": [
            "Deploy positive-pressure mechanical blowers for continuous forced ventilation.",
            "Equip all entrants with calibrated continuous-reading personal multi-gas monitors.",
            "Provide emergency escape breathing apparatus (EEBA) or supplied-air respirators."
        ]
    },

    # 4. Mobile Equipment & Struck-By
    {
        "id": "PRE-STRK-01",
        "label": "Struck-By Moving Equipment",
        "description": "Worker on foot working in traffic zone, blind spot, or travel path of forklifts, dump trucks, excavators, or loaders without high-visibility gear or physical segregation.",
        "hazard_category": "Struck-By",
        "base_weight": 0.85,
        "keywords": ["forklift", "truck", "loader", "pedestrian", "blind spot", "heavy machinery", "traffic path", "struck by"],
        "remediation_steps": [
            "Erect physical pedestrian guardrails and painted walkway floor markings.",
            "Enforce mandatory Class 2/3 high-visibility safety vests for all warehouse personnel.",
            "Equip forklifts with operating 360-degree blue warning spot lamps and backup audio beepers."
        ]
    },
    {
        "id": "PRE-STRK-02",
        "label": "Suspended Load Line of Fire",
        "description": "Workers standing or walking directly underneath crane hooks, suspended loads, rigging cables, or hoisted precast concrete and steel beams.",
        "hazard_category": "Crush Injury",
        "base_weight": 0.90,
        "keywords": ["suspended load", "under hook", "rigging", "crane lift", "overhead hoist", "hoisted load", "falling object"],
        "remediation_steps": [
            "Enforce zero-tolerance rule: 'No personnel permitted under suspended loads at any time'.",
            "Establish drop-zone exclusion barricade with safety cones and warning tape.",
            "Use guide tag-lines to steer hoisted loads safely from a safe standoff distance."
        ]
    },
    {
        "id": "PRE-STRK-03",
        "label": "Unsecured Cargo and Unstable Stacks",
        "description": "Heavy industrial materials, pipes, drums, or pallets stacked unevenly, unchocked, or exceeding safe height limits risking toppling over onto personnel.",
        "hazard_category": "Crush Injury",
        "base_weight": 0.78,
        "keywords": ["unstable stack", "falling pallet", "tilted drums", "pipe roll", "collapse stack", "tip over"],
        "remediation_steps": [
            "Restack materials immediately with interlocking patterns and maximum 3:1 height-to-base ratio.",
            "Install wheel chocks and wooden wedges under cylindrical materials and pipes.",
            "Wrap stacked pallet goods with heavy-duty stretch film or strap with tensioned bands."
        ]
    },

    # 5. Machine Guarding & Caught-Between
    {
        "id": "PRE-MECH-01",
        "label": "Bypassed Safety Device",
        "description": "Physical safety guards, interlocks, emergency stop buttons, light curtains, or protective enclosures removed, disabled, or bypassed on operating machines.",
        "hazard_category": "Caught-In/Between",
        "base_weight": 0.89,
        "keywords": ["bypassed interlock", "removed guard", "machine guard missing", "disabled sensor", "e-stop broken"],
        "remediation_steps": [
            "Shut down machinery immediately until safety interlocks are restored and tested.",
            "Re-install heavy-gauge wire mesh / steel guards covering all operational hazard zones.",
            "Conduct safety audit to identify and replace tampered interlock keys with tamper-resistant switches."
        ]
    },
    {
        "id": "PRE-MECH-02",
        "label": "Rotating Parts and Nip Point Exposure",
        "description": "Exposed rotating shafts, conveyor belts, rollers, gears, pulleys, or drive chains without safety covers creating catastrophic entanglement risk.",
        "hazard_category": "Amputation",
        "base_weight": 0.87,
        "keywords": ["nip point", "pinch point", "conveyor", "rotating shaft", "gears exposed", "pulley", "entanglement", "amputation"],
        "remediation_steps": [
            "Install fixed metal nip-point guards and chain/belt transmission housings.",
            "Install accessible emergency stop pull-cords along the entire length of the conveyor.",
            "Enforce strict loose-clothing, long-hair tie-back, and anti-jewelry machine shop rules."
        ]
    },

    # 6. Pressure & Stored Energy
    {
        "id": "PRE-PRES-01",
        "label": "Uncontrolled Stored Energy Release",
        "description": "Hydraulic systems, pneumatic lines, steam pipes, or pressurized vessels serviced without relieving residual pressure, bleeding lines, or blocking mechanisms.",
        "hazard_category": "Explosion",
        "base_weight": 0.88,
        "keywords": ["hydraulic pressure", "pneumatic line", "steam leak", "pressurized pipe", "bleeder valve", "burst pipe"],
        "remediation_steps": [
            "Depressurize lines and verify 0 PSI reading on calibrated gauges before opening couplings.",
            "Insert mechanical safety lock blocks under elevated hydraulic rams/pistons.",
            "Replace aged or weeping flexible hydraulic hoses with high-burst pressure braided assemblies."
        ]
    },
    {
        "id": "PRE-PRES-02",
        "label": "Damaged Compressed Gas Cylinders",
        "description": "High pressure gas cylinders unchained, missing valve protection caps, damaged regulator, or stored in close proximity to sparks or incompatible chemicals.",
        "hazard_category": "Explosion",
        "base_weight": 0.82,
        "keywords": ["gas cylinder", "oxygen tank", "acetylene", "unsecured cylinder", "missing cap", "tank regulator"],
        "remediation_steps": [
            "Chain all compressed gas cylinders upright to a sturdy wall rack or cylinder cart.",
            "Screw on steel valve protective caps whenever cylinders are stored or in transit.",
            "Separate oxygen and flammable fuel gas cylinders by minimum 20 feet or a 5-foot firewall."
        ]
    },

    # 7. Chemical & Toxic Hazards
    {
        "id": "PRE-CHEM-01",
        "label": "Chemical Exposure Without PPE",
        "description": "Handling corrosive acids, solvents, caustic liquids, or toxic reagents without chemical gloves, goggles, face shield, or emergency wash stations available.",
        "hazard_category": "Chemical Burn",
        "base_weight": 0.80,
        "keywords": ["chemical spill", "acid splash", "solvent", "corrosive", "no chemical gloves", "caustic", "toxic leak"],
        "remediation_steps": [
            "Mandate nitrile/neoprene chemical-resistant gloves, splash goggles, and face shields.",
            "Inspect and flush emergency eyewash and safety shower stations to confirm 15-minute continuous flow.",
            "Deploy neutralizing absorbent spill kit and place hazardous chemical containment drums."
        ]
    },
    {
        "id": "PRE-CHEM-02",
        "label": "Flammable Vapor and Hot Work Hazard",
        "description": "Welding, cutting, or spark-producing operations conducted near fuel storage, solvent tanks, or unventilated flammable vapor zones without hot work permits.",
        "hazard_category": "Fire & Explosion",
        "base_weight": 0.91,
        "keywords": ["hot work", "welding near fuel", "sparks near solvent", "flammable vapors", "fire hazard", "no extinguisher"],
        "remediation_steps": [
            "Clear all flammable liquids, solvents, and combustible debris within 35 feet of hot work.",
            "Issue hot work permit and require dedicated fire watch with ABC dry chemical extinguisher for 60 mins post-work.",
            "Use explosion-proof exhaust fans to vent solvent fumes before striking any arc or flame."
        ]
    },

    # 8. Trenching & Excavation
    {
        "id": "PRE-EXCV-01",
        "label": "Unprotected Trench and Cave-In Hazard",
        "description": "Excavation or trench deeper than 1.5 meters (5 feet) without trench box, shoring, benching, or sloping, with workers inside and spoil pile right at edge.",
        "hazard_category": "Cave-In",
        "base_weight": 0.94,
        "keywords": ["trench collapse", "cave-in", "excavation", "no shoring", "trench box missing", "spoil pile edge", "ditch collapse"],
        "remediation_steps": [
            "Evacuate workers immediately from un-shored trench; install certified trench shield/shoring.",
            "Move excavated spoil pile and heavy machinery at least 2 feet (0.6 meters) back from edge.",
            "Provide exit ladders every 25 feet of lateral travel for excavations 4 feet or deeper."
        ]
    },

    # 9. Environmental & Structural
    {
        "id": "PRE-STRC-01",
        "label": "Structural Instability and Collapse Hazard",
        "description": "Weakened load-bearing walls, damaged structural columns, excessive floor load, corroded steel trusses, or cracking ceiling foundations.",
        "hazard_category": "Structural Collapse",
        "base_weight": 0.89,
        "keywords": ["cracked pillar", "wall crack", "sagging roof", "structural collapse", "damaged beam", "foundation sink"],
        "remediation_steps": [
            "Evacuate compromised area and establish an external structural collapse safety perimeter.",
            "Install temporary steel shoring jacks / load-bearing acrow props under sagging members.",
            "Commission immediate structural engineering inspection before re-occupying the building."
        ]
    },
    {
        "id": "PRE-ENV-01",
        "label": "Slippery Walkways and Minor Trip Hazards",
        "description": "Accumulation of light debris, tools, power cords across walkways, or wet floor without caution signs resulting in slips or minor falls on same level.",
        "hazard_category": "Slip and Trip",
        "base_weight": 0.35,
        "keywords": ["slip", "trip", "wet floor sign missing", "cluttered aisle", "extension cord across floor", "puddle"],
        "remediation_steps": [
            "Place high-visibility 'CAUTION - WET FLOOR' warning cones around the spill immediately.",
            "Mop and squeegee standing liquid dry; check overhead pipes/valves for recurring leaks.",
            "Reroute or tape down loose electrical cords using rubber floor cord-protector channels."
        ]
    },
    {
        "id": "PRE-ENV-02",
        "label": "Inadequate Workplace Illumination",
        "description": "Burnt-out light fixtures, dim corridors, or unlit stairwells impairing worker visibility in hazardous operational zones.",
        "hazard_category": "Visibility Hazard",
        "base_weight": 0.40,
        "keywords": ["dim lighting", "dark stairwell", "lights out", "poor visibility", "flickering bulb"],
        "remediation_steps": [
            "Deploy portable high-output LED work lights to restore safe illumination levels immediately.",
            "Replace blown fluorescent/LED tubes in stairwells and primary access pathways.",
            "Conduct monthly emergency lighting backup battery inspection."
        ]
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

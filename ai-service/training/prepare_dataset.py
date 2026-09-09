"""
ForeSite - Training Dataset Generator
Generates high-fidelity safety incident reports paired with their true SIF precursors.
Creates training pairs (Anchor, Positive) suitable for SentenceTransformer MultipleNegativesRankingLoss.
"""

import json
import os
from pathlib import Path

DATASET_SAMPLES = [
    # Electrical
    {
        "report": "Found bare copper wires exposed near the main intake water pump in Sector 4. Wire insulation is completely stripped.",
        "precursor": "Energized Equipment Exposure: Worker or equipment is in contact with or near energized electrical parts or bare conductors without proper isolation or barricading.",
        "category": "Electrical"
    },
    {
        "report": "Maintenance technician started repairing the conveyor belt drive without tagging out the electrical distribution panel.",
        "precursor": "Inadequate Isolation/Lockout: Lack of lockout tagout LOTO procedures, energy isolation missing before repair, maintenance, or cleaning.",
        "category": "Electrical"
    },
    {
        "report": "Water leak from roof dripping directly into the 480V electrical junction box on the factory floor.",
        "precursor": "Proximity to Electrical Hazard: Electrical components, panels, or junction boxes exposed to water, damp floors, or conductive fluids.",
        "category": "Electrical"
    },
    {
        "report": "Mobile boom crane operating within 3 meters of 33kV overhead power lines during transformer unloading.",
        "precursor": "Overhead Power Line Contact Risk: Cranes, booms, scaffolding, or elevated platforms operating within unsafe approach boundary of overhead high-voltage power lines.",
        "category": "Electrical"
    },

    # Falls
    {
        "report": "Subcontractor observed standing on the top plate of the warehouse roof without safety harness or lifeline.",
        "precursor": "Working at Height Without Protection: Worker elevated above 1.8 meters or 6 feet without personal fall arrest system, harness, lanyard, or guardrails.",
        "category": "Fall from Height"
    },
    {
        "report": "Third-floor scaffolding platform missing middle guardrail and multiple wooden planks are unsecured.",
        "precursor": "Unsecured or Damaged Scaffolding: Scaffolding missing toe boards, cross bracing, base plates, tie-ins, or planks improperly secured.",
        "category": "Fall from Height"
    },
    {
        "report": "Uncovered hole on the mezzanine floor measuring 1x1 meter with no warning tape or barricade.",
        "precursor": "Uncovered Floor Openings and Shafts: Uncovered or unmarked floor holes, elevator shafts, roof penetrations lacking load-bearing covers.",
        "category": "Fall from Height"
    },
    {
        "report": "Worker using a damaged wooden ladder with cracked rungs, standing on the very top step to reach lighting fixture.",
        "precursor": "Improper Ladder Usage: Damaged ladders, metal ladders near live conductors, untied ladders, or workers overreaching.",
        "category": "Fall from Height"
    },

    # Confined Space
    {
        "report": "Cleaning crew entered underground storm drain vessel without gas detector or entry permit.",
        "precursor": "Confined Space Entry Without Permit: Worker entering manhole, vessel, tank, silo, vault, or trench without atmospheric testing or entry permit.",
        "category": "Confined Space"
    },
    {
        "report": "Strong rotten egg smell noticed inside sewer pit; oxygen monitor alarm sounding at 18.2%.",
        "precursor": "Hazardous Atmosphere Accumulation: Oxygen deficiency below 19.5% or enrichment above 23.5%, toxic gas presence like hydrogen sulfide or methane.",
        "category": "Confined Space"
    },

    # Struck-by / Mobile Equipment
    {
        "report": "Forklift reversing at high speed in blind corridor near pedestrian break room with broken backup beeper.",
        "precursor": "Struck-By Moving Equipment: Worker on foot working in traffic zone, blind spot, or travel path of forklifts or loaders without high-visibility gear.",
        "category": "Struck-By"
    },
    {
        "report": "Rigging crew walking directly underneath a 5-ton precast concrete slab being hoisted by tower crane.",
        "precursor": "Suspended Load Line of Fire: Workers standing or walking directly underneath crane hooks, suspended loads, rigging cables.",
        "category": "Struck-By"
    },
    {
        "report": "Steel pipes stacked 4 tiers high without end chocks or restraining straps; stack appears unstable.",
        "precursor": "Unsecured Cargo and Unstable Stacks: Heavy industrial materials, pipes, drums, or pallets stacked unevenly, unchocked, or exceeding safe height limits.",
        "category": "Crush Injury"
    },

    # Machine Guarding
    {
        "report": "Interlock switch on hydraulic press safety door bypassed using a zip tie so machine runs with door open.",
        "precursor": "Bypassed Safety Device: Physical safety guards, interlocks, emergency stop buttons, or protective enclosures removed, disabled, or bypassed.",
        "category": "Caught-In/Between"
    },
    {
        "report": "In-feed rollers on high-speed packaging conveyor completely unguarded; worker clothing brushing against rollers.",
        "precursor": "Rotating Parts and Nip Point Exposure: Exposed rotating shafts, conveyor belts, rollers, gears, pulleys, or drive chains without safety covers.",
        "category": "Caught-In/Between"
    },

    # Pressure & Hot Work
    {
        "report": "Contractor torch cutting structural beam next to open solvent degreasing tank with no hot work permit.",
        "precursor": "Flammable Vapor and Hot Work Hazard: Welding, cutting, or spark-producing operations conducted near fuel storage or flammable vapor zones.",
        "category": "Fire & Explosion"
    },
    {
        "report": "Compressed acetylene cylinder discovered lying horizontally without valve protective cap near battery charger.",
        "precursor": "Damaged Compressed Gas Cylinders: High pressure gas cylinders unchained, missing valve protection caps, damaged regulator.",
        "category": "Fire & Explosion"
    },
    {
        "report": "High-pressure hydraulic hose bulging severely and weeping fluid near main hydraulic clamp.",
        "precursor": "Uncontrolled Stored Energy Release: Hydraulic systems, pneumatic lines, steam pipes, or pressurized vessels serviced without relieving residual pressure.",
        "category": "Pressure"
    },

    # Trenching
    {
        "report": "Two pipelayers working inside 8-foot deep trench with vertical unsupported soil walls and excavator operating right at the rim.",
        "precursor": "Unprotected Trench and Cave-In Hazard: Excavation or trench deeper than 1.5 meters (5 feet) without trench box, shoring, benching, or sloping.",
        "category": "Cave-In"
    },

    # Low Risk / Non-SIF
    {
        "report": "Small puddle of clean mop water in reception hallway. Cleaning cart nearby but yellow caution sign is absent.",
        "precursor": "Slippery Walkways and Minor Trip Hazards: Accumulation of light debris, tools, power cords across walkways, or wet floor without caution signs.",
        "category": "Slip and Trip"
    },
    {
        "report": "Overhead fluorescent bulb flickering in secondary archive storage room. Difficult to read label folders.",
        "precursor": "Inadequate Workplace Illumination: Burnt-out light fixtures, dim corridors, or unlit stairwells impairing worker visibility.",
        "category": "Visibility Hazard"
    }
]

def generate_dataset(output_path: str):
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(DATASET_SAMPLES, f, indent=2)
    print(f"Generated {len(DATASET_SAMPLES)} training pairs at: {output_path}")

if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "training_pairs.json"
    generate_dataset(str(out))

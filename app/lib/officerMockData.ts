// ─── Types ───────────────────────────────────────────────────────────────────

export type Category =
  | 'electrical'
  | 'fall'
  | 'chemical'
  | 'fire'
  | 'machinery'
  | 'structural'
  | 'ppe';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus =
  | 'pending'
  | 'under_review'
  | 'action_assigned'
  | 'analysis_complete'
  | 'resolved';

export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface OfficerReport {
  _id: string;
  title: string;
  location: string;
  zone: string;
  category: Category;
  severity: Severity;
  status: ReportStatus;
  riskScore: number;
  submittedBy: string;
  department: string;
  createdAt: string;
  hasImage: boolean;
  description: string;
  immediateActions: string[];
  recommendations: string[];
}

export interface HeatmapZone {
  id: string;
  name: string;
  riskScore: number;
  incidents: number;
  lastIncident: string | null;
  category: Category;
}

export interface WeeklyTrend {
  week: string;
  total: number;
  critical: number;
  high: number;
  resolved: number;
}

export interface CategoryStat {
  category: string;
  key: Category;
  count: number;
  percentage: number;
  color: string;
}

export interface ActiveAlert {
  _id: string;
  title: string;
  zone: string;
  location: string;
  riskScore: number;
  timeAgo: string;
  severity: Severity;
  acknowledged: boolean;
  submittedBy: string;
  category: Category;
}

export interface MaintenanceTask {
  _id: string;
  title: string;
  reportId: string;
  reportTitle: string;
  status: TaskStatus;
  assignedTo: string | null;
  dueDate: string;
  priority: Severity;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const MOCK_REPORTS: OfficerReport[] = [
  {
    _id: 'rpt-001',
    title: 'Exposed Wiring Near Assembly Line B',
    location: 'Building 2, Floor 1',
    zone: 'Zone A-2',
    category: 'electrical',
    severity: 'critical',
    status: 'action_assigned',
    riskScore: 92,
    submittedBy: 'Arjun Mehta',
    department: 'Manufacturing',
    createdAt: '2026-09-09T08:22:00.000Z',
    hasImage: true,
    description:
      'Worker noticed bare copper wiring exposed beneath the main conveyor belt junction box. The insulation appears to have been damaged by mechanical abrasion. Moisture ingress is possible given the proximity to the cooling system outlet.',
    immediateActions: [
      'Isolate power to the affected junction box immediately',
      'Cordon off 3-metre radius around the exposed wiring',
      'Post warning signs at all entry points to Zone A-2',
      'Deploy temporary rubber matting over the area',
    ],
    recommendations: [
      'Replace entire conduit run from junction box JB-14 to panel PNL-B2',
      'Install GFCI breakers on all circuits in Zone A-2',
      'Schedule monthly electrical inspections for Building 2',
      'Review cable routing to prevent future mechanical abrasion',
    ],
  },
  {
    _id: 'rpt-002',
    title: 'Unsecured Scaffolding on West Facade',
    location: 'Building 5, Exterior West',
    zone: 'Zone E-5',
    category: 'fall',
    severity: 'critical',
    status: 'pending',
    riskScore: 88,
    submittedBy: 'Priya Nair',
    department: 'Construction',
    createdAt: '2026-09-09T11:45:00.000Z',
    hasImage: true,
    description:
      'Scaffolding on the west facade of Building 5 was found without proper guardrails on the third tier. Two planks are missing and the base plates are not anchored to the ground. Wind load poses significant overturning risk.',
    immediateActions: [
      'Halt all work on the west facade immediately',
      'Evacuate personnel from the scaffolding structure',
      'Notify site supervisor and scaffolding contractor',
      'Place barriers preventing access at ground level',
    ],
    recommendations: [
      'Engage a certified scaffolding engineer for full structural inspection',
      'Replace missing planks and install compliant guardrails',
      'Ensure all base plates are pinned per IS 3696 standards',
      'Conduct refresher training for scaffolding erection crew',
    ],
  },
  {
    _id: 'rpt-003',
    title: 'Chemical Spill in Acid Storage Room',
    location: 'Building 3, Basement',
    zone: 'Zone C-3',
    category: 'chemical',
    severity: 'critical',
    status: 'under_review',
    riskScore: 95,
    submittedBy: 'Rahul Singh',
    department: 'Chemical Processing',
    createdAt: '2026-09-08T14:10:00.000Z',
    hasImage: true,
    description:
      'Approximately 20 litres of hydrochloric acid leaked from a corroded drum in the acid storage room. The spill has reached the floor drain. Fumes are detectable at the corridor entrance. No personnel were directly exposed.',
    immediateActions: [
      'Seal the corridor and evacuate Building 3 basement',
      'Activate emergency ventilation for the storage room',
      'Don full PPE (Level B) before entering the spill zone',
      'Apply neutralising agent (sodium bicarbonate) to contain the spill',
    ],
    recommendations: [
      'Replace all drums older than 3 years in the acid storage room',
      'Install chemical-resistant secondary containment berms',
      'Upgrade drain system with acid-neutralisation interceptor',
      'Review chemical inventory and dispose of excess stock',
    ],
  },
  {
    _id: 'rpt-004',
    title: 'Fire Suppression System Offline in Warehouse C',
    location: 'Warehouse C, Main Floor',
    zone: 'Zone W-3',
    category: 'fire',
    severity: 'high',
    status: 'action_assigned',
    riskScore: 78,
    submittedBy: 'Sneha Patel',
    department: 'Logistics',
    createdAt: '2026-09-08T09:30:00.000Z',
    hasImage: false,
    description:
      'The automated sprinkler system in Warehouse C has been offline for 36 hours due to a faulty solenoid valve. Warehouse stores flammable packaging materials. Fire extinguishers on-site are beyond their service date.',
    immediateActions: [
      'Post fire watch personnel at all entry points to Warehouse C',
      'Prohibit all hot work in or near the warehouse',
      'Verify hand extinguishers are charged and accessible',
      'Notify local fire brigade of temporary system outage',
    ],
    recommendations: [
      'Replace solenoid valve SV-C14 within 24 hours',
      'Service and tag all portable extinguishers',
      'Implement weekly fire suppression system testing',
      'Store flammable materials in compliant fire-rated cabinets',
    ],
  },
  {
    _id: 'rpt-005',
    title: 'CNC Machine Guard Removed on Shop Floor',
    location: 'Building 1, Shop Floor',
    zone: 'Zone M-1',
    category: 'machinery',
    severity: 'high',
    status: 'under_review',
    riskScore: 74,
    submittedBy: 'Vikram Joshi',
    department: 'Manufacturing',
    createdAt: '2026-09-07T15:55:00.000Z',
    hasImage: true,
    description:
      'Machine guard on CNC lathe unit ML-07 has been removed and not reinstalled. The rotating chuck is fully exposed during operation. Operator was observed working without the guard in place for at least two production shifts.',
    immediateActions: [
      'Stop operation of ML-07 immediately',
      'Lock out / Tag out the machine per LOTO procedure',
      'Identify and counsel the operator responsible',
      'Inspect all other CNC machines for missing guards',
    ],
    recommendations: [
      'Reinstall and secure the guard before returning ML-07 to service',
      'Add tamper-evident seals to all machine guards',
      'Conduct mandatory LOTO refresher training for shop floor staff',
      'Install a presence-sensing interlock on ML-07',
    ],
  },
  {
    _id: 'rpt-006',
    title: 'PPE Non-Compliance at Chemical Lab Entry',
    location: 'Building 3, Level 2',
    zone: 'Zone C-2',
    category: 'ppe',
    severity: 'medium',
    status: 'analysis_complete',
    riskScore: 55,
    submittedBy: 'Ananya Kumar',
    department: 'Quality Assurance',
    createdAt: '2026-09-07T10:20:00.000Z',
    hasImage: false,
    description:
      'Three workers observed entering the chemical analysis lab without required splash goggles and chemical-resistant gloves. Lab entrance signage exists but PPE dispensers were found empty.',
    immediateActions: [
      'Immediately restock PPE dispensers at lab entry',
      'Issue verbal warning to the three workers observed',
      'Post a supervisor at the entry point until dispensers are full',
    ],
    recommendations: [
      'Implement electronic access control requiring PPE scan-in',
      'Increase PPE restocking frequency to twice daily',
      'Conduct PPE compliance awareness training for all lab personnel',
      'Add automated PPE dispenser with low-stock alert',
    ],
  },
  {
    _id: 'rpt-007',
    title: 'Cracked Load-Bearing Column in Parking Structure',
    location: 'Parking Block P2, Level 3',
    zone: 'Zone S-2',
    category: 'structural',
    severity: 'high',
    status: 'pending',
    riskScore: 81,
    submittedBy: 'Rohan Desai',
    department: 'Facilities',
    createdAt: '2026-09-06T16:40:00.000Z',
    hasImage: true,
    description:
      'A vertical crack approximately 2.4 metres long and 8mm wide has appeared on column C-14 in the parking structure. The crack runs through the reinforced concrete core and rebar is visible. Structural integrity is uncertain.',
    immediateActions: [
      'Close Level 3 of Parking Block P2 to vehicles and pedestrians',
      'Engage a structural engineer within 4 hours',
      'Install crack monitors to detect any widening',
      'Shore up adjacent bays if engineer advises',
    ],
    recommendations: [
      'Commission full structural assessment of all P2 columns',
      'Repair crack per structural engineer specifications',
      'Increase inspection frequency for parking structures to quarterly',
      'Review vehicle weight limits for the parking facility',
    ],
  },
  {
    _id: 'rpt-008',
    title: 'Faulty Electrical Panel in Canteen Block',
    location: 'Canteen Block, Utility Room',
    zone: 'Zone A-4',
    category: 'electrical',
    severity: 'medium',
    status: 'resolved',
    riskScore: 48,
    submittedBy: 'Meera Iyer',
    department: 'Facilities',
    createdAt: '2026-09-05T07:50:00.000Z',
    hasImage: false,
    description:
      'Circuit breakers in panel PNL-C1 were found tripping repeatedly under normal load. Panel door does not latch properly. Evidence of overheating (discolouration) on three bus bars inside the panel.',
    immediateActions: [
      'Reduce connected load on PNL-C1 by switching off non-essential circuits',
      'Post a Do Not Use sign on panel door',
      'Check for loose connections causing overheating',
    ],
    recommendations: [
      'Replace PNL-C1 with appropriately rated panel',
      'Load-balance circuits across the canteen utility room',
      'Implement thermographic scanning of all electrical panels annually',
    ],
  },
  {
    _id: 'rpt-009',
    title: 'Missing Safety Nets at Roof Work Area',
    location: 'Building 7, Roof Level',
    zone: 'Zone E-7',
    category: 'fall',
    severity: 'high',
    status: 'action_assigned',
    riskScore: 76,
    submittedBy: 'Kiran Rao',
    department: 'Maintenance',
    createdAt: '2026-09-05T13:15:00.000Z',
    hasImage: true,
    description:
      'Safety nets that should be deployed along the perimeter of Building 7 rooftop work area are absent. Workers have been observed within 1.5 metres of the unprotected roof edge without fall arrest equipment.',
    immediateActions: [
      'Stop all rooftop work until fall protection is in place',
      'Issue harness and lanyard to all workers on site',
      'Install temporary rope barriers at roof edge',
    ],
    recommendations: [
      'Install permanent perimeter safety netting per IS 11057',
      'Mandate personal fall arrest system for all rooftop activities',
      'Review permit-to-work process for rooftop access',
    ],
  },
  {
    _id: 'rpt-010',
    title: 'Gas Cylinder Storage Non-Compliant Layout',
    location: 'Building 4, Storage Bay',
    zone: 'Zone F-4',
    category: 'fire',
    severity: 'medium',
    status: 'analysis_complete',
    riskScore: 61,
    submittedBy: 'Sanjay Kulkarni',
    department: 'Engineering',
    createdAt: '2026-09-04T09:00:00.000Z',
    hasImage: false,
    description:
      'LPG and oxygen cylinders stored in the same bay without required 3-metre segregation. Cylinders are not chained and several are stored horizontally. The area lacks adequate ventilation.',
    immediateActions: [
      'Separate LPG and oxygen cylinders immediately',
      'Chain all cylinders in upright position',
      'Open bay doors to increase ventilation',
    ],
    recommendations: [
      'Construct dedicated segregated storage areas for incompatible gases',
      'Install chain restraint racks for all cylinders',
      'Improve natural and forced ventilation in the storage bay',
      'Label all cylinders and storage areas per GHS standards',
    ],
  },
  {
    _id: 'rpt-011',
    title: 'Chemical Leak at Coolant Line Junction',
    location: 'Building 2, Floor 2',
    zone: 'Zone C-1',
    category: 'chemical',
    severity: 'medium',
    status: 'resolved',
    riskScore: 44,
    submittedBy: 'Divya Sharma',
    department: 'Manufacturing',
    createdAt: '2026-09-03T12:30:00.000Z',
    hasImage: true,
    description:
      'Slow coolant drip detected at pipe junction near CNC cluster. Coolant pooling on floor creating slip hazard. Not corrosive but contains biocides.',
    immediateActions: [
      'Place absorbent pads and wet floor signs',
      'Tighten or replace leaking joint',
      'Dispose of contaminated absorbent as chemical waste',
    ],
    recommendations: [
      'Replace all flex hose junctions older than 5 years',
      'Schedule monthly inspection of coolant lines',
      'Improve chemical waste disposal documentation',
    ],
  },
  {
    _id: 'rpt-012',
    title: 'Inadequate Lighting in Stairwell D',
    location: 'Building 6, Stairwell D',
    zone: 'Zone S-6',
    category: 'fall',
    severity: 'low',
    status: 'resolved',
    riskScore: 28,
    submittedBy: 'Neha Gupta',
    department: 'Facilities',
    createdAt: '2026-09-03T08:05:00.000Z',
    hasImage: false,
    description:
      'Three lighting fixtures on levels 2 and 3 of Stairwell D are non-functional, reducing illuminance below the 100-lux minimum required by IS 3646.',
    immediateActions: [
      'Install temporary battery-powered LED lamps on affected levels',
      'Post warning signs at stairwell entry points',
    ],
    recommendations: [
      'Replace failed fixtures with LED fittings',
      'Implement bi-annual lighting audits across all stairwells',
      'Install emergency backup lighting on all staircases',
    ],
  },
  {
    _id: 'rpt-013',
    title: 'Forklift Near-Miss at Pedestrian Crossing',
    location: 'Warehouse A, Bay 3',
    zone: 'Zone W-1',
    category: 'machinery',
    severity: 'high',
    status: 'under_review',
    riskScore: 72,
    submittedBy: 'Arun Thomas',
    department: 'Logistics',
    createdAt: '2026-09-02T14:50:00.000Z',
    hasImage: false,
    description:
      'A forklift travelling at speed nearly struck a pedestrian at the designated crossing in Bay 3. Visibility mirrors at the crossing were missing. The forklift operator did not sound the horn.',
    immediateActions: [
      'Install temporary barriers separating pedestrian and forklift routes',
      'Mandate horns at all crossings for forklift operators',
      'Suspend the involved operator for investigation',
    ],
    recommendations: [
      'Install convex mirrors at all blind crossing points',
      'Paint pedestrian walkways with high-visibility markings',
      'Implement mandatory pedestrian exclusion zones during forklift operation',
      'Fit forklifts with proximity sensors',
    ],
  },
  {
    _id: 'rpt-014',
    title: 'Blocked Emergency Exit in Production Hall',
    location: 'Building 1, Production Hall',
    zone: 'Zone M-2',
    category: 'fire',
    severity: 'medium',
    status: 'resolved',
    riskScore: 52,
    submittedBy: 'Pooja Verma',
    department: 'Manufacturing',
    createdAt: '2026-09-01T11:00:00.000Z',
    hasImage: false,
    description:
      'Emergency exit EX-07 in the production hall was found blocked by a pallet of raw material. Exit sign above the door was also not illuminated.',
    immediateActions: [
      'Remove pallet from emergency exit immediately',
      'Replace faulty exit sign lamp',
      'Conduct emergency exit walkthrough of the entire building',
    ],
    recommendations: [
      'Mark a clear 1-metre keep-clear zone at all emergency exits',
      'Add daily shift check for exit obstruction to supervisor checklist',
      'Install self-powered LED emergency exit signs',
    ],
  },
  {
    _id: 'rpt-015',
    title: 'Damaged PPE Hard Hats Beyond Service Life',
    location: 'Building 4, PPE Store',
    zone: 'Zone A-3',
    category: 'ppe',
    severity: 'low',
    status: 'resolved',
    riskScore: 22,
    submittedBy: 'Suresh Babu',
    department: 'EHS',
    createdAt: '2026-08-30T09:45:00.000Z',
    hasImage: false,
    description:
      'During audit of the PPE store, 23 hard hats were found beyond their 5-year service life. Some exhibit visible cracks in the shell. These had not been removed from circulation.',
    immediateActions: [
      'Remove all expired hard hats from the PPE store immediately',
      'Issue replacement hard hats to affected workers',
      'Record serial numbers and disposal of condemned PPE',
    ],
    recommendations: [
      'Implement PPE expiry tracking system with automated alerts',
      'Conduct quarterly PPE audits across all sites',
      'Train stores personnel on PPE lifecycle management',
    ],
  },
];

// ─── Heatmap Zones ────────────────────────────────────────────────────────────

export const HEATMAP_ZONES: HeatmapZone[] = [
  { id: 'z01', name: 'Zone A-1', riskScore: 35, incidents: 3, lastIncident: '2026-09-07T10:00:00.000Z', category: 'electrical' },
  { id: 'z02', name: 'Zone A-2', riskScore: 92, incidents: 8, lastIncident: '2026-09-09T08:22:00.000Z', category: 'electrical' },
  { id: 'z03', name: 'Zone A-3', riskScore: 22, incidents: 1, lastIncident: '2026-08-30T09:45:00.000Z', category: 'ppe' },
  { id: 'z04', name: 'Zone A-4', riskScore: 48, incidents: 2, lastIncident: '2026-09-05T07:50:00.000Z', category: 'electrical' },
  { id: 'z05', name: 'Zone B-1', riskScore: 15, incidents: 0, lastIncident: null, category: 'fall' },
  { id: 'z06', name: 'Zone C-1', riskScore: 44, incidents: 2, lastIncident: '2026-09-03T12:30:00.000Z', category: 'chemical' },
  { id: 'z07', name: 'Zone C-2', riskScore: 55, incidents: 3, lastIncident: '2026-09-07T10:20:00.000Z', category: 'ppe' },
  { id: 'z08', name: 'Zone C-3', riskScore: 95, incidents: 6, lastIncident: '2026-09-08T14:10:00.000Z', category: 'chemical' },
  { id: 'z09', name: 'Zone D-1', riskScore: 30, incidents: 2, lastIncident: '2026-09-01T11:00:00.000Z', category: 'fire' },
  { id: 'z10', name: 'Zone E-5', riskScore: 88, incidents: 5, lastIncident: '2026-09-09T11:45:00.000Z', category: 'fall' },
  { id: 'z11', name: 'Zone E-7', riskScore: 76, incidents: 4, lastIncident: '2026-09-05T13:15:00.000Z', category: 'fall' },
  { id: 'z12', name: 'Zone F-4', riskScore: 61, incidents: 3, lastIncident: '2026-09-04T09:00:00.000Z', category: 'fire' },
  { id: 'z13', name: 'Zone M-1', riskScore: 74, incidents: 4, lastIncident: '2026-09-07T15:55:00.000Z', category: 'machinery' },
  { id: 'z14', name: 'Zone M-2', riskScore: 52, incidents: 2, lastIncident: '2026-09-01T11:00:00.000Z', category: 'fire' },
  { id: 'z15', name: 'Zone S-2', riskScore: 81, incidents: 3, lastIncident: '2026-09-06T16:40:00.000Z', category: 'structural' },
  { id: 'z16', name: 'Zone S-6', riskScore: 28, incidents: 1, lastIncident: '2026-09-03T08:05:00.000Z', category: 'fall' },
  { id: 'z17', name: 'Zone W-1', riskScore: 72, incidents: 4, lastIncident: '2026-09-02T14:50:00.000Z', category: 'machinery' },
  { id: 'z18', name: 'Zone W-3', riskScore: 78, incidents: 5, lastIncident: '2026-09-08T09:30:00.000Z', category: 'fire' },
  { id: 'z19', name: 'Zone X-1', riskScore: 18, incidents: 0, lastIncident: null, category: 'structural' },
  { id: 'z20', name: 'Zone Y-2', riskScore: 40, incidents: 2, lastIncident: '2026-09-06T09:00:00.000Z', category: 'chemical' },
];

// ─── Weekly Trend ─────────────────────────────────────────────────────────────

export const WEEKLY_TREND: WeeklyTrend[] = [
  { week: 'Jul 7',  total: 5,  critical: 1, high: 2, resolved: 3 },
  { week: 'Jul 14', total: 7,  critical: 2, high: 2, resolved: 4 },
  { week: 'Jul 21', total: 6,  critical: 1, high: 3, resolved: 5 },
  { week: 'Jul 28', total: 9,  critical: 3, high: 3, resolved: 6 },
  { week: 'Aug 4',  total: 8,  critical: 2, high: 3, resolved: 5 },
  { week: 'Aug 11', total: 11, critical: 3, high: 4, resolved: 7 },
  { week: 'Aug 18', total: 10, critical: 2, high: 4, resolved: 8 },
  { week: 'Aug 25', total: 13, critical: 4, high: 5, resolved: 9 },
  { week: 'Sep 1',  total: 12, critical: 3, high: 4, resolved: 8 },
  { week: 'Sep 8',  total: 15, critical: 5, high: 5, resolved: 6 },
];

// ─── Category Stats ───────────────────────────────────────────────────────────

export const CATEGORY_STATS: CategoryStat[] = [
  { category: 'Electrical',  key: 'electrical',  count: 13, percentage: 28, color: '#f59e0b' },
  { category: 'Fall Risk',   key: 'fall',        count: 10, percentage: 22, color: '#3b82f6' },
  { category: 'Chemical',    key: 'chemical',    count: 8,  percentage: 18, color: '#8b5cf6' },
  { category: 'Fire',        key: 'fire',        count: 7,  percentage: 15, color: '#ef4444' },
  { category: 'Machinery',   key: 'machinery',   count: 5,  percentage: 10, color: '#6366f1' },
  { category: 'Structural',  key: 'structural',  count: 2,  percentage: 4,  color: '#78716c' },
  { category: 'PPE',         key: 'ppe',         count: 1,  percentage: 3,  color: '#10b981' },
];

// ─── Active Alerts ────────────────────────────────────────────────────────────

export const ACTIVE_ALERTS: ActiveAlert[] = [
  {
    _id: 'alt-001',
    title: 'Chemical Spill in Acid Storage Room',
    zone: 'Zone C-3',
    location: 'Building 3, Basement',
    riskScore: 95,
    timeAgo: '19 hours ago',
    severity: 'critical',
    acknowledged: false,
    submittedBy: 'Rahul Singh',
    category: 'chemical',
  },
  {
    _id: 'alt-002',
    title: 'Exposed Wiring Near Assembly Line B',
    zone: 'Zone A-2',
    location: 'Building 2, Floor 1',
    riskScore: 92,
    timeAgo: '1 day ago',
    severity: 'critical',
    acknowledged: false,
    submittedBy: 'Arjun Mehta',
    category: 'electrical',
  },
  {
    _id: 'alt-003',
    title: 'Unsecured Scaffolding on West Facade',
    zone: 'Zone E-5',
    location: 'Building 5, Exterior West',
    riskScore: 88,
    timeAgo: '1 day ago',
    severity: 'critical',
    acknowledged: false,
    submittedBy: 'Priya Nair',
    category: 'fall',
  },
  {
    _id: 'alt-004',
    title: 'Cracked Load-Bearing Column in Parking Structure',
    zone: 'Zone S-2',
    location: 'Parking Block P2, Level 3',
    riskScore: 81,
    timeAgo: '3 days ago',
    severity: 'critical',
    acknowledged: true,
    submittedBy: 'Rohan Desai',
    category: 'structural',
  },
  {
    _id: 'alt-005',
    title: 'Fire Suppression System Offline in Warehouse C',
    zone: 'Zone W-3',
    location: 'Warehouse C, Main Floor',
    riskScore: 78,
    timeAgo: '2 days ago',
    severity: 'high',
    acknowledged: false,
    submittedBy: 'Sneha Patel',
    category: 'fire',
  },
];

// ─── Maintenance Tasks ────────────────────────────────────────────────────────

export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    _id: 'tsk-001',
    title: 'Replace exposed wiring conduit at Junction Box JB-14',
    reportId: 'rpt-001',
    reportTitle: 'Exposed Wiring Near Assembly Line B',
    status: 'in_progress',
    assignedTo: 'Electrician Team A',
    dueDate: '2026-09-11',
    priority: 'critical',
  },
  {
    _id: 'tsk-002',
    title: 'Install compliant guardrails on scaffolding tier 3',
    reportId: 'rpt-002',
    reportTitle: 'Unsecured Scaffolding on West Facade',
    status: 'pending',
    assignedTo: null,
    dueDate: '2026-09-10',
    priority: 'critical',
  },
  {
    _id: 'tsk-003',
    title: 'Chemical spill containment and drum replacement',
    reportId: 'rpt-003',
    reportTitle: 'Chemical Spill in Acid Storage Room',
    status: 'in_progress',
    assignedTo: 'Chemical Response Team',
    dueDate: '2026-09-11',
    priority: 'critical',
  },
  {
    _id: 'tsk-004',
    title: 'Replace solenoid valve SV-C14 in fire suppression system',
    reportId: 'rpt-004',
    reportTitle: 'Fire Suppression System Offline in Warehouse C',
    status: 'pending',
    assignedTo: null,
    dueDate: '2026-09-12',
    priority: 'high',
  },
  {
    _id: 'tsk-005',
    title: 'Reinstall and secure machine guard on CNC ML-07',
    reportId: 'rpt-005',
    reportTitle: 'CNC Machine Guard Removed on Shop Floor',
    status: 'done',
    assignedTo: 'Maintenance Crew B',
    dueDate: '2026-09-09',
    priority: 'high',
  },
  {
    _id: 'tsk-006',
    title: 'Structural repair of column C-14, Parking Block P2',
    reportId: 'rpt-007',
    reportTitle: 'Cracked Load-Bearing Column in Parking Structure',
    status: 'pending',
    assignedTo: null,
    dueDate: '2026-09-15',
    priority: 'critical',
  },
];

// ─── Maintenance Workers ──────────────────────────────────────────────────────

export const MAINTENANCE_WORKERS = [
  'Electrician Team A',
  'Electrician Team B',
  'Chemical Response Team',
  'Maintenance Crew A',
  'Maintenance Crew B',
  'Scaffolding Contractor',
  'Structural Engineering Team',
  'Fire Safety Team',
];

// data.js — Static reference data for BravaPlan Project App

let EMPLOYEES = [
  { id: 'e1',  name: 'Marcus Thompson',  role: 'Project Director',        dept: 'Management',  color: '#2563eb' },
  { id: 'e2',  name: 'Sarah Chen',        role: 'Senior Project Manager',  dept: 'Management',  color: '#7c3aed' },
  { id: 'e3',  name: 'David Rodriguez',   role: 'Project Manager',         dept: 'Management',  color: '#0891b2' },
  { id: 'e4',  name: 'Emily Watson',      role: 'Civil Engineer',          dept: 'Engineering', color: '#059669' },
  { id: 'e5',  name: 'James O\'Brien',    role: 'Structural Engineer',     dept: 'Engineering', color: '#d97706' },
  { id: 'e6',  name: 'Priya Patel',       role: 'Geotechnical Engineer',   dept: 'Engineering', color: '#9333ea' },
  { id: 'e7',  name: 'Michael Foster',    role: 'Hydraulic Engineer',      dept: 'Engineering', color: '#0284c7' },
  { id: 'e8',  name: 'Lisa Nakamura',     role: 'Transportation Engineer', dept: 'Engineering', color: '#16a34a' },
  { id: 'e9',  name: 'Carlos Mendez',     role: 'Site Supervisor',         dept: 'Field',       color: '#dc2626' },
  { id: 'e10', name: 'Amanda Johnson',    role: 'Site Supervisor',         dept: 'Field',       color: '#db2777' },
  { id: 'e11', name: 'Robert Kim',        role: 'Survey Technician',       dept: 'Field',       color: '#65a30d' },
  { id: 'e12', name: 'Jennifer Lee',      role: 'CAD Technician',          dept: 'Design',      color: '#ea580c' },
  { id: 'e13', name: 'Thomas Brown',      role: 'Safety Officer',          dept: 'Safety',      color: '#b91c1c' },
  { id: 'e14', name: 'Rachel Martinez',   role: 'QC Inspector',            dept: 'Quality',     color: '#0369a1' },
  { id: 'e15', name: 'Kevin Zhang',       role: 'Construction Manager',    dept: 'Field',       color: '#6d28d9' },
  { id: 'e16', name: 'Olivia Taylor',     role: 'Environmental Engineer',  dept: 'Engineering', color: '#047857' },
  { id: 'e17', name: 'Daniel Harris',     role: 'Civil Engineer',          dept: 'Engineering', color: '#b45309' },
  { id: 'e18', name: 'Sophie Wilson',     role: 'Senior Civil Engineer',   dept: 'Engineering', color: '#7c3aed' },
  { id: 'e19', name: 'Nathan Clark',      role: 'Cost Estimator',          dept: 'Finance',     color: '#1d4ed8' },
  { id: 'e20', name: 'Maria Gonzalez',    role: 'CAD Technician',          dept: 'Design',      color: '#be185d' },
  { id: 'e21', name: 'Alex Turner',       role: 'Survey Technician',       dept: 'Field',       color: '#15803d' },
  { id: 'e22', name: 'Brittany Moore',    role: 'Project Manager',         dept: 'Management',  color: '#6d28d9' }
];

const PROJECTS = [
  { id: 'p1', name: 'Highway 45 Extension',       color: '#ef4444' },
  { id: 'p2', name: 'River Bridge Renovation',    color: '#3b82f6' },
  { id: 'p3', name: 'Downtown Drainage System',   color: '#8b5cf6' },
  { id: 'p4', name: 'West Commercial Foundation', color: '#f97316' },
  { id: 'p5', name: 'Airport Runway Inspection',  color: '#14b8a6' },
  { id: 'p6', name: 'Metro Station Assessment',   color: '#eab308' },
  { id: 'p7', name: 'Riverside Embankment',       color: '#22c55e' },
  { id: 'p8', name: 'Industrial Park Survey',     color: '#ec4899' }
];

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      color: '#16a34a', bg: '#dcfce7' },
  medium:   { label: 'Medium',   color: '#d97706', bg: '#fef3c7' },
  high:     { label: 'High',     color: '#ea580c', bg: '#ffedd5' },
  critical: { label: 'Critical', color: '#dc2626', bg: '#fee2e2' }
};

const STATUS_CONFIG = {
  todo:       { label: 'To Do',       color: '#475569', bg: '#f1f5f9' },
  inprogress: { label: 'In Progress', color: '#2563eb', bg: '#dbeafe' },
  inreview:   { label: 'In Review',   color: '#7c3aed', bg: '#ede9fe' },
  done:       { label: 'Done',        color: '#16a34a', bg: '#dcfce7' }
};

const STATUS_CYCLE = ['todo', 'inprogress', 'inreview', 'done'];

// Generate date offset from today
function daysOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

const SAMPLE_TASKS = [
  {
    id: 't1',
    title: 'Geotechnical Assessment – Section B',
    desc: 'Conduct soil sampling and analysis for Section B of the Highway 45 Extension. Review bearing capacity and settlement potential.',
    project: 'p1', priority: 'high', status: 'inprogress',
    assignees: ['e6', 'e4'], date: daysOffset(-10), time: '08:00',
    dueDate: daysOffset(3), tags: ['geotechnical', 'soil', 'field'],
    createdAt: daysOffset(-14)
  },
  {
    id: 't2',
    title: 'Structural Load Capacity Analysis',
    desc: 'Perform detailed structural load capacity analysis for the River Bridge Renovation. Assess current load ratings and recommend upgrades.',
    project: 'p2', priority: 'critical', status: 'inprogress',
    assignees: ['e5', 'e18'], date: daysOffset(-8), time: '09:00',
    dueDate: daysOffset(1), tags: ['structural', 'load', 'bridge'],
    createdAt: daysOffset(-12)
  },
  {
    id: 't3',
    title: 'FEMA Flood Zone Compliance Check',
    desc: 'Review and verify FEMA flood zone mapping for the Downtown Drainage System. Ensure all designs meet FEMA compliance requirements.',
    project: 'p3', priority: 'high', status: 'inreview',
    assignees: ['e7', 'e16'], date: daysOffset(-5), time: '10:00',
    dueDate: daysOffset(0), tags: ['FEMA', 'compliance', 'flood'],
    createdAt: daysOffset(-10)
  },
  {
    id: 't4',
    title: 'Foundation Bearing Capacity Report',
    desc: 'Prepare comprehensive bearing capacity report for West Commercial Foundation. Include pile design recommendations and settlement analysis.',
    project: 'p4', priority: 'critical', status: 'todo',
    assignees: ['e6', 'e5', 'e17'], date: daysOffset(2), time: '08:30',
    dueDate: daysOffset(7), tags: ['foundation', 'bearing', 'report'],
    createdAt: daysOffset(-7)
  },
  {
    id: 't5',
    title: 'FAA Compliance Documentation',
    desc: 'Compile and submit FAA compliance documentation for Airport Runway Inspection. Coordinate with airport authority for regulatory sign-off.',
    project: 'p5', priority: 'critical', status: 'inreview',
    assignees: ['e8', 'e1', 'e3'], date: daysOffset(-3), time: '09:30',
    dueDate: daysOffset(0), tags: ['FAA', 'compliance', 'documentation'],
    createdAt: daysOffset(-9)
  },
  {
    id: 't6',
    title: 'Pavement Condition Survey – Runway 28L',
    desc: 'Conduct visual and instrument-based pavement condition survey on Runway 28L. Document cracks, rutting, and surface deformations.',
    project: 'p5', priority: 'high', status: 'done',
    assignees: ['e11', 'e21', 'e14'], date: daysOffset(-12), time: '06:00',
    dueDate: daysOffset(-8), tags: ['pavement', 'survey', 'runway'],
    createdAt: daysOffset(-14)
  },
  {
    id: 't7',
    title: 'Traffic Impact Assessment – Phase 2',
    desc: 'Complete phase 2 traffic impact assessment for Highway 45 Extension. Model traffic flow scenarios for 5 and 20-year projections.',
    project: 'p1', priority: 'medium', status: 'inprogress',
    assignees: ['e8', 'e3'], date: daysOffset(-6), time: '08:00',
    dueDate: daysOffset(5), tags: ['traffic', 'assessment', 'highway'],
    createdAt: daysOffset(-11)
  },
  {
    id: 't8',
    title: 'Stormwater Drainage Design – Block C',
    desc: 'Design stormwater drainage network for Block C of the Downtown Drainage System. Size pipes and detention basins for 100-year storm event.',
    project: 'p3', priority: 'high', status: 'todo',
    assignees: ['e7', 'e4'], date: daysOffset(1), time: '08:00',
    dueDate: daysOffset(10), tags: ['drainage', 'stormwater', 'design'],
    createdAt: daysOffset(-5)
  },
  {
    id: 't9',
    title: 'Safety Audit – Bridge Deck Scaffolding',
    desc: 'Conduct full safety audit of scaffolding systems on River Bridge Renovation site. Verify load ratings and fall protection compliance.',
    project: 'p2', priority: 'critical', status: 'done',
    assignees: ['e13', 'e9'], date: daysOffset(-11), time: '07:00',
    dueDate: daysOffset(-9), tags: ['safety', 'scaffolding', 'audit'],
    createdAt: daysOffset(-13)
  },
  {
    id: 't10',
    title: 'Topographic Survey – Metro Station Site',
    desc: 'Complete topographic survey of metro station assessment site. Establish control points and deliver AutoCAD drawing set.',
    project: 'p6', priority: 'medium', status: 'inprogress',
    assignees: ['e11', 'e21', 'e12'], date: daysOffset(-4), time: '07:30',
    dueDate: daysOffset(4), tags: ['survey', 'topographic', 'metro'],
    createdAt: daysOffset(-8)
  },
  {
    id: 't11',
    title: 'Environmental Impact Statement – Embankment',
    desc: 'Prepare Environmental Impact Statement for Riverside Embankment project. Include wetland delineation and habitat assessments.',
    project: 'p7', priority: 'high', status: 'todo',
    assignees: ['e16', 'e2'], date: daysOffset(3), time: '09:00',
    dueDate: daysOffset(14), tags: ['environmental', 'EIS', 'wetland'],
    createdAt: daysOffset(-4)
  },
  {
    id: 't12',
    title: 'CAD Drawings – Bridge Abutments',
    desc: 'Produce detailed CAD drawings for bridge abutments at River Bridge Renovation. Coordinate with structural and geotechnical teams.',
    project: 'p2', priority: 'medium', status: 'inprogress',
    assignees: ['e12', 'e20'], date: daysOffset(-7), time: '08:30',
    dueDate: daysOffset(6), tags: ['CAD', 'drawings', 'abutments'],
    createdAt: daysOffset(-10)
  },
  {
    id: 't13',
    title: 'Cost Estimation – Highway Interchange',
    desc: 'Develop detailed cost estimation for the Highway 45 Extension interchange. Include material, labor, and contingency budgets.',
    project: 'p1', priority: 'medium', status: 'inreview',
    assignees: ['e19', 'e1', 'e3'], date: daysOffset(-2), time: '09:00',
    dueDate: daysOffset(2), tags: ['cost', 'estimation', 'interchange'],
    createdAt: daysOffset(-6)
  },
  {
    id: 't14',
    title: 'Pile Installation Inspection',
    desc: 'Inspect pile installation progress at West Commercial Foundation site. Verify pile depths, alignment, and concrete mix specifications.',
    project: 'p4', priority: 'high', status: 'inprogress',
    assignees: ['e9', 'e14', 'e15'], date: daysOffset(-1), time: '07:00',
    dueDate: daysOffset(3), tags: ['piles', 'inspection', 'foundation'],
    createdAt: daysOffset(-5)
  },
  {
    id: 't15',
    title: 'Slope Stability Analysis – Embankment',
    desc: 'Run slope stability analyses for Riverside Embankment using limit equilibrium methods. Assess failure scenarios and recommend stabilization measures.',
    project: 'p7', priority: 'critical', status: 'todo',
    assignees: ['e6', 'e5'], date: daysOffset(5), time: '08:00',
    dueDate: daysOffset(18), tags: ['slope', 'stability', 'geotechnical'],
    createdAt: daysOffset(-3)
  },
  {
    id: 't16',
    title: 'Industrial Park Boundary Survey',
    desc: 'Establish legal boundary survey for Industrial Park Survey project. Research deeds, resolve conflicts, and set corner monuments.',
    project: 'p8', priority: 'medium', status: 'done',
    assignees: ['e21', 'e11'], date: daysOffset(-13), time: '07:00',
    dueDate: daysOffset(-10), tags: ['boundary', 'survey', 'legal'],
    createdAt: daysOffset(-14)
  },
  {
    id: 't17',
    title: 'QC Concrete Pour – Abutment Footing',
    desc: 'Quality control inspection of concrete pour for abutment footing at River Bridge Renovation. Sample concrete, verify slump, and document placement.',
    project: 'p2', priority: 'high', status: 'done',
    assignees: ['e14', 'e13'], date: daysOffset(-9), time: '06:30',
    dueDate: daysOffset(-7), tags: ['QC', 'concrete', 'inspection'],
    createdAt: daysOffset(-12)
  },
  {
    id: 't18',
    title: 'Hydraulic Modeling – Storm Sewer Network',
    desc: 'Develop hydraulic model for the Downtown Drainage System storm sewer network using EPA SWMM. Calibrate model and run design storm simulations.',
    project: 'p3', priority: 'high', status: 'inprogress',
    assignees: ['e7', 'e4', 'e16'], date: daysOffset(-3), time: '08:00',
    dueDate: daysOffset(8), tags: ['hydraulic', 'modeling', 'SWMM'],
    createdAt: daysOffset(-7)
  },
  {
    id: 't19',
    title: 'Metro Station Structural Integrity Review',
    desc: 'Assess structural integrity of existing Metro Station concrete elements. Document deterioration, calculate residual capacity, and propose remediation.',
    project: 'p6', priority: 'critical', status: 'inreview',
    assignees: ['e5', 'e18', 'e2'], date: daysOffset(-2), time: '09:30',
    dueDate: daysOffset(1), tags: ['structural', 'integrity', 'metro'],
    createdAt: daysOffset(-6)
  },
  {
    id: 't20',
    title: 'Asphalt Pavement Design – Industrial Roads',
    desc: 'Design flexible asphalt pavement structure for internal roads at Industrial Park. Use AASHTO method based on traffic loading and subgrade CBR.',
    project: 'p8', priority: 'medium', status: 'todo',
    assignees: ['e4', 'e17'], date: daysOffset(4), time: '08:30',
    dueDate: daysOffset(16), tags: ['pavement', 'asphalt', 'design'],
    createdAt: daysOffset(-2)
  },
  {
    id: 't21',
    title: 'Erosion Control Plan – Embankment',
    desc: 'Develop erosion and sediment control plan for Riverside Embankment construction phase. Specify SWPPP measures and inspection schedule.',
    project: 'p7', priority: 'medium', status: 'inprogress',
    assignees: ['e16', 'e9', 'e10'], date: daysOffset(-5), time: '08:00',
    dueDate: daysOffset(7), tags: ['erosion', 'SWPPP', 'environmental'],
    createdAt: daysOffset(-8)
  },
  {
    id: 't22',
    title: 'Safety Toolbox Talk – Excavation Works',
    desc: 'Conduct mandatory toolbox talk covering excavation safety, shoring requirements, and utility locating procedures for Highway 45 Extension.',
    project: 'p1', priority: 'medium', status: 'done',
    assignees: ['e13', 'e9', 'e10'], date: daysOffset(-7), time: '06:30',
    dueDate: daysOffset(-7), tags: ['safety', 'toolbox', 'excavation'],
    createdAt: daysOffset(-9)
  },
  {
    id: 't23',
    title: 'Retaining Wall Design – Cut Slope',
    desc: 'Design cantilevered retaining wall for cut slope on Highway 45 Extension. Provide full structural calculations and reinforcement drawings.',
    project: 'p1', priority: 'high', status: 'todo',
    assignees: ['e5', 'e18', 'e12'], date: daysOffset(6), time: '09:00',
    dueDate: daysOffset(21), tags: ['retaining wall', 'structural', 'design'],
    createdAt: daysOffset(-1)
  },
  {
    id: 't24',
    title: 'Drainage Channel Rehabilitation – North Reach',
    desc: 'Assess and design rehabilitation of existing drainage channel for Downtown Drainage System north reach. Evaluate lining options.',
    project: 'p3', priority: 'medium', status: 'todo',
    assignees: ['e7', 'e17'], date: daysOffset(7), time: '08:00',
    dueDate: daysOffset(19), tags: ['drainage', 'rehabilitation', 'channel'],
    createdAt: daysOffset(0)
  },
  {
    id: 't25',
    title: 'Weekly Site Progress Report – Highway 45',
    desc: 'Compile weekly site progress report for Highway 45 Extension. Include photo documentation, schedule update, and workforce counts.',
    project: 'p1', priority: 'low', status: 'done',
    assignees: ['e3', 'e9'], date: daysOffset(-7), time: '15:00',
    dueDate: daysOffset(-6), tags: ['progress', 'report', 'weekly'],
    createdAt: daysOffset(-8)
  },
  {
    id: 't26',
    title: 'Utility Relocation Coordination',
    desc: 'Coordinate with utility providers for underground service relocation ahead of Highway 45 Extension excavation. Confirm clearances and schedules.',
    project: 'p1', priority: 'high', status: 'inprogress',
    assignees: ['e15', 'e3', 'e10'], date: daysOffset(-4), time: '10:00',
    dueDate: daysOffset(4), tags: ['utilities', 'relocation', 'coordination'],
    createdAt: daysOffset(-7)
  },
  {
    id: 't27',
    title: 'Bridge Deck Waterproofing Specification',
    desc: 'Develop waterproofing specification for River Bridge Renovation deck. Evaluate membrane systems, detail expansion joints, and drainage scuppers.',
    project: 'p2', priority: 'medium', status: 'inreview',
    assignees: ['e18', 'e4'], date: daysOffset(-1), time: '09:00',
    dueDate: daysOffset(3), tags: ['waterproofing', 'bridge', 'specification'],
    createdAt: daysOffset(-5)
  },
  {
    id: 't28',
    title: 'Airport Perimeter Fence Survey',
    desc: 'Conduct as-built survey of existing airport perimeter fence alignment. Identify encroachments and produce corrected legal description.',
    project: 'p5', priority: 'low', status: 'done',
    assignees: ['e11', 'e21'], date: daysOffset(-14), time: '07:00',
    dueDate: daysOffset(-11), tags: ['survey', 'perimeter', 'airport'],
    createdAt: daysOffset(-14)
  },
  {
    id: 't29',
    title: 'Groundwater Monitoring Plan',
    desc: 'Design groundwater monitoring well network for West Commercial Foundation site. Specify well construction details and sampling protocol.',
    project: 'p4', priority: 'medium', status: 'todo',
    assignees: ['e6', 'e16'], date: daysOffset(8), time: '09:00',
    dueDate: daysOffset(20), tags: ['groundwater', 'monitoring', 'wells'],
    createdAt: daysOffset(0)
  },
  {
    id: 't30',
    title: 'As-Built Drawing Review – Metro Platform',
    desc: 'Review as-built drawings for Metro Station platform construction. Verify dimensions against design drawings and note deviations.',
    project: 'p6', priority: 'low', status: 'inprogress',
    assignees: ['e12', 'e20', 'e14'], date: daysOffset(-3), time: '10:00',
    dueDate: daysOffset(5), tags: ['as-built', 'drawings', 'review'],
    createdAt: daysOffset(-6)
  },
  {
    id: 't31',
    title: 'Industrial Park Utility Layout Plan',
    desc: 'Prepare utility layout plan for Industrial Park Survey showing proposed water, sewer, electrical, and gas corridors.',
    project: 'p8', priority: 'medium', status: 'inreview',
    assignees: ['e4', 'e12', 'e19'], date: daysOffset(-1), time: '08:00',
    dueDate: daysOffset(2), tags: ['utilities', 'layout', 'industrial'],
    createdAt: daysOffset(-4)
  },
  {
    id: 't32',
    title: 'Embankment Fill Material Testing',
    desc: 'Perform Proctor compaction tests and CBR testing on proposed embankment fill material sources for Riverside Embankment project.',
    project: 'p7', priority: 'high', status: 'done',
    assignees: ['e6', 'e14'], date: daysOffset(-10), time: '08:00',
    dueDate: daysOffset(-6), tags: ['fill', 'compaction', 'testing'],
    createdAt: daysOffset(-12)
  },
  {
    id: 't33',
    title: 'Noise Impact Assessment – Highway Corridor',
    desc: 'Conduct noise impact assessment along Highway 45 Extension corridor. Model traffic noise levels and recommend mitigation measures.',
    project: 'p1', priority: 'low', status: 'todo',
    assignees: ['e16', 'e8'], date: daysOffset(10), time: '09:00',
    dueDate: daysOffset(21), tags: ['noise', 'assessment', 'environment'],
    createdAt: daysOffset(0)
  },
  {
    id: 't34',
    title: 'Foundation Excavation Safety Review',
    desc: 'Review and approve excavation safety plan for West Commercial Foundation deep excavation. Check shoring design and dewatering provisions.',
    project: 'p4', priority: 'critical', status: 'inprogress',
    assignees: ['e13', 'e15', 'e9'], date: daysOffset(-2), time: '07:30',
    dueDate: daysOffset(0), tags: ['safety', 'excavation', 'review'],
    createdAt: daysOffset(-5)
  }
];

// Expose to global scope
window.EMPLOYEES = EMPLOYEES;
window.PROJECTS = PROJECTS;
window.PRIORITY_CONFIG = PRIORITY_CONFIG;
window.STATUS_CONFIG = STATUS_CONFIG;
window.STATUS_CYCLE = STATUS_CYCLE;
window.SAMPLE_TASKS = SAMPLE_TASKS;

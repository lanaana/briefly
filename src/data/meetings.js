export const MEETINGS = [
  {
    id: 'meeting-1',
    title: 'Product Sync',
    date: '2025-04-14',
    day: 'Mon',
    startTime: '10:00',
    endTime: '11:00',
    duration: '1h',
    attendees: ['Lana', 'Dmytro', 'Olena', 'Sasha'],
  },
  {
    id: 'meeting-2',
    title: 'Design Review',
    date: '2025-04-14',
    day: 'Mon',
    startTime: '14:00',
    endTime: '15:00',
    duration: '1h',
    attendees: ['Lana', 'Marta'],
  },
  {
    id: 'meeting-3',
    title: '1:1 with Anton',
    date: '2025-04-15',
    day: 'Tue',
    startTime: '11:00',
    endTime: '11:30',
    duration: '30m',
    attendees: ['Lana', 'Anton'],
  },
  {
    id: 'meeting-4',
    title: 'Marketing Standup',
    date: '2025-04-16',
    day: 'Wed',
    startTime: '09:00',
    endTime: '09:30',
    duration: '30m',
    attendees: ['Lana', 'Roma', 'Kate', 'Vlad', 'Sofi'],
  },
  {
    id: 'meeting-5',
    title: 'Investor Call',
    date: '2025-04-17',
    day: 'Thu',
    startTime: '15:00',
    endTime: '16:30',
    duration: '1h 30m',
    attendees: ['Lana', 'Anton', 'Dmytro'],
  },
  {
    id: 'meeting-6',
    title: 'Retrospective',
    date: '2025-04-18',
    day: 'Fri',
    startTime: '13:00',
    endTime: '14:00',
    duration: '1h',
    attendees: ['Full team'],
    isFullTeam: true,
    teamSize: 8,
  },
]

export const INITIAL_SUMMARIES = {
  'meeting-1': {
    summary: {
      context:
        'Weekly product sync to align the cross-functional team on Q2 roadmap priorities, review sprint progress, and surface blockers before the mid-quarter check-in.',
      mainIdeas: [
        'Q2 onboarding redesign milestone is at risk — currently running about one week behind schedule',
        'Team agreed to deprioritize the analytics dashboard and push it to Q3 to protect core delivery',
        'Design system components are ready for handoff but need engineering estimation before sprint planning',
        'Customer feedback loop needs a structured process — team agreed on a weekly support digest',
      ],
      actionPoints: [
        'Lana to share updated Q2 roadmap doc with revised timelines by EOD Wednesday',
        'Dmytro to coordinate with backend team to unblock the auth integration by Thursday',
        'Olena to send design system component specs to engineering for estimation',
        'Sasha to set up the weekly support digest pipeline by end of sprint',
      ],
    },
    rawNotes:
      "Product sync went well. Q2 roadmap — onboarding redesign is behind, maybe 1 week. Analytics dashboard not happening this quarter, push to Q3. Design system stuff is done from design side but eng hasn't estimated yet. Customer feedback is messy, we need a weekly digest from support team. Dmytro needs to sort out the auth thing with backend. Lana will update the roadmap doc.",
    generatedAt: '2025-04-14T10:32:00.000Z',
  },
}

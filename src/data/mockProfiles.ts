export const mockProfiles = {
  'free@taxacademy.sg': {
    subscription_status: 'free' as const,
    full_name: 'Free User',
    purchases: []
  },
  'payper@taxacademy.sg': {
    subscription_status: 'free' as const,
    full_name: 'Pay-Per-View User',
    purchases: ['1', '2', '3', '4', '5']
  },
  'subscriber@taxacademy.sg': {
    subscription_status: 'active' as const,
    full_name: 'Premium Member',
    purchases: []
  }
};

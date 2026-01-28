
export const MODEL_IMAGE_MAP: Record<string, string> = {
    // iPhone X Series
    'iPhone X': '/assets/models/iphone-x.png',
    'iPhone XR': '/assets/models/iphone-xr.png',
    'iPhone XS': '/assets/models/iphone-xs.png',
    'iPhone XS Max': '/assets/models/iphone-xs.png',

    // iPhone 11 Series
    'iPhone 11': '/assets/models/iphone-11.png',
    'iPhone 11 Pro': '/assets/models/iphone-11-pro.png',
    'iPhone 11 Pro Max': '/assets/models/iphone-11-pm.png',
    'iPhone SE 2020': '/assets/models/iphone-se.png',

    // iPhone 12 Series
    'iPhone 12': '/assets/models/iphone-12.png',
    'iPhone 12 Mini': '/assets/models/iphone-12-mini.png',
    'iPhone 12 Pro': '/assets/models/iphone-12-pro.png',
    'iPhone 12 Pro Max': '/assets/models/iphone-12-pm.png',

    // iPhone 13 Series
    'iPhone 13': '/assets/models/iphone-13.png',
    'iPhone 13 Mini': '/assets/models/iphone-13-mini.png',
    'iPhone 13 Pro': '/assets/models/iphone-13-pro.png',
    'iPhone 13 Pro Max': '/assets/models/iphone-13-pm.png',

    // iPhone 14 Series
    'iPhone 14': '/assets/models/iphone-14.png',
    'iPhone 14 Plus': '/assets/models/iphone-14-plus.png',
    'iPhone 14 Pro': '/assets/models/iphone-14-pro.png',
    'iPhone 14 Pro Max': '/assets/models/iphone-14-pm.png',
    'iPhone SE 2022': '/assets/models/iphone-12.png',

    // iPhone 15 Series
    'iPhone 15': '/assets/models/iphone-15.png',
    'iPhone 15 Plus': '/assets/models/iphone-15-plus.png',
    'iPhone 15 Pro': '/assets/models/iphone-15-pro.png',
    'iPhone 15 Pro Max': '/assets/models/iphone-15-pm.png',

    // iPhone 16 Series
    'iPhone 16': '/assets/models/iphone-16.png',
    'iPhone 16 Plus': '/assets/models/iphone-16-plus.png',
    'iPhone 16 Pro': '/assets/models/iphone-16-pro.png',
    'iPhone 16 Pro Max': '/assets/models/iphone-16-pm.png',
    'iPhone 16e': '/assets/models/iphone-16e.png',

    // iPhone 17
    'iPhone 17': '/assets/models/iphone-17.png',
    'iPhone 17 Pro': '/assets/models/iphone-17-pro.png',
    'iPhone 17 Pro Max': '/assets/models/iphone-17-pm.png',
    'iPhone Air': '/assets/models/iphone-air.png',

    // Case Sensitivity / Variant Fixes
    'iPhone 12 mini': '/assets/models/iphone-12-mini.png',
    'iPhone 13 mini': '/assets/models/iphone-13-mini.png',
    'iPhone XS MAX': '/assets/models/iphone-xs.png',
};

export const FALLBACK_PRICING = [
    { model: 'iPhone 13', storage: '128GB', price: 6000000 },
    { model: 'iPhone 13', storage: '256GB', price: 7000000 },
    { model: 'iPhone 14', storage: '128GB', price: 8000000 },
    { model: 'iPhone 14 Pro', storage: '256GB', price: 10000000 },
];

export const FALLBACK_CONFIG = [
    { key: 'deduction_no_box', value: 3000 },
    { key: 'deduction_battery_80_84', value: 3000 },
    { key: 'deduction_rank_s', value: 3000 },
    { key: 'deduction_rank_a_plus', value: 4500 },
    { key: 'deduction_rank_a', value: 6000 },
];

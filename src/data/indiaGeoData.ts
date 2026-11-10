export interface IndianState {
  code: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  zoom: number;
  districts: string[];
}

export const INDIA_STATES: IndianState[] = [
  {
    code: 'TN',
    name: 'Tamil Nadu',
    capital: 'Chennai',
    lat: 11.1271,
    lng: 78.6569,
    zoom: 7,
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Kanchipuram', 'Thanjavur']
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    capital: 'Mumbai',
    lat: 19.7515,
    lng: 75.7139,
    zoom: 7,
    districts: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded']
  },
  {
    code: 'KA',
    name: 'Karnataka',
    capital: 'Bengaluru',
    lat: 15.3173,
    lng: 75.7139,
    zoom: 7,
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Ballari', 'Shimoga', 'Udupi']
  },
  {
    code: 'DL',
    name: 'Delhi',
    capital: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090,
    zoom: 11,
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North East Delhi', 'South West Delhi']
  },
  {
    code: 'KL',
    name: 'Kerala',
    capital: 'Thiruvananthapuram',
    lat: 10.8505,
    lng: 76.2711,
    zoom: 7,
    districts: ['Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Malappuram', 'Alappuzha', 'Kottayam', 'Wayanad']
  },
  {
    code: 'WB',
    name: 'West Bengal',
    capital: 'Kolkata',
    lat: 22.9868,
    lng: 87.8550,
    zoom: 7,
    districts: ['Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas', 'Darjeeling', 'Siliguri', 'Hooghly', 'Murshidabad', 'Paschim Bardhaman']
  },
  {
    code: 'OD',
    name: 'Odisha',
    capital: 'Bhubaneswar',
    lat: 20.9517,
    lng: 85.0985,
    zoom: 7,
    districts: ['Khordha', 'Cuttack', 'Puri', 'Ganjam', 'Balasore', 'Sambalpur', 'Rourkela', 'Bhadrak', 'Mayurbhanj', 'Angul']
  },
  {
    code: 'TS',
    name: 'Telangana',
    capital: 'Hyderabad',
    lat: 18.1124,
    lng: 79.0193,
    zoom: 7,
    districts: ['Hyderabad', 'Ranga Reddy', 'Medchal', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Mahabubnagar']
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    capital: 'Amaravati',
    lat: 15.9129,
    lng: 79.7400,
    zoom: 7,
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Anantapur', 'Kadapa']
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    capital: 'Gandhinagar',
    lat: 22.2587,
    lng: 71.1924,
    zoom: 7,
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Kutch']
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    capital: 'Jaipur',
    lat: 27.0238,
    lng: 74.2179,
    zoom: 6,
    districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bhilwara', 'Sikar']
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    capital: 'Lucknow',
    lat: 26.8467,
    lng: 80.9462,
    zoom: 6,
    districts: ['Lucknow', 'Kanpur', 'Varanasi', 'Noida', 'Ghaziabad', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Gorakhpur']
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    capital: 'Bhopal',
    lat: 22.9734,
    lng: 78.6569,
    zoom: 6,
    districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna']
  },
  {
    code: 'BR',
    name: 'Bihar',
    capital: 'Patna',
    lat: 25.0961,
    lng: 85.3131,
    zoom: 7,
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif']
  },
  {
    code: 'PB',
    name: 'Punjab',
    capital: 'Chandigarh',
    lat: 31.1471,
    lng: 75.3412,
    zoom: 8,
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur']
  },
  {
    code: 'HR',
    name: 'Haryana',
    capital: 'Chandigarh',
    lat: 29.0588,
    lng: 76.0856,
    zoom: 8,
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal']
  },
  {
    code: 'AS',
    name: 'Assam',
    capital: 'Dispur',
    lat: 26.2006,
    lng: 92.9376,
    zoom: 7,
    districts: ['Guwahati (Kamrup)', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur']
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    capital: 'Ranchi',
    lat: 23.6102,
    lng: 85.2799,
    zoom: 7,
    districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh']
  },
  {
    code: 'CT',
    name: 'Chhattisgarh',
    capital: 'Raipur',
    lat: 21.2787,
    lng: 81.8661,
    zoom: 7,
    districts: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon']
  },
  {
    code: 'UT',
    name: 'Uttarakhand',
    capital: 'Dehradun',
    lat: 30.0668,
    lng: 79.0193,
    zoom: 8,
    districts: ['Dehradun', 'Haridwar', 'Nainital', 'Rishikesh', 'Udham Singh Nagar', 'Chamoli']
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    capital: 'Shimla',
    lat: 31.1048,
    lng: 77.1734,
    zoom: 8,
    districts: ['Shimla', 'Dharamshala (Kangra)', 'Mandi', 'Solan', 'Kullu', 'Sirmaur']
  },
  {
    code: 'GA',
    name: 'Goa',
    capital: 'Panaji',
    lat: 15.2993,
    lng: 74.1240,
    zoom: 10,
    districts: ['North Goa', 'South Goa']
  },
  {
    code: 'TR',
    name: 'Tripura',
    capital: 'Agartala',
    lat: 23.9408,
    lng: 91.9882,
    zoom: 8,
    districts: ['West Tripura', 'South Tripura', 'Dhalai', 'North Tripura']
  },
  {
    code: 'MN',
    name: 'Manipur',
    capital: 'Imphal',
    lat: 24.6637,
    lng: 93.9063,
    zoom: 8,
    districts: ['Imphal West', 'Imphal East', 'Thoubal', 'Churachandpur']
  },
  {
    code: 'ML',
    name: 'Meghalaya',
    capital: 'Shillong',
    lat: 25.4670,
    lng: 91.3662,
    zoom: 8,
    districts: ['East Khasi Hills', 'West Garo Hills', 'Ri-Bhoi', 'West Jaintia Hills']
  },
  {
    code: 'NL',
    name: 'Nagaland',
    capital: 'Kohima',
    lat: 26.1584,
    lng: 94.5624,
    zoom: 8,
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha']
  },
  {
    code: 'MZ',
    name: 'Mizoram',
    capital: 'Aizawl',
    lat: 23.1645,
    lng: 92.9376,
    zoom: 8,
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib']
  },
  {
    code: 'AR',
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    lat: 28.2180,
    lng: 94.7278,
    zoom: 7,
    districts: ['Papum Pare', 'Changlang', 'West Kameng', 'Tawang']
  },
  {
    code: 'SK',
    name: 'Sikkim',
    capital: 'Gangtok',
    lat: 27.5330,
    lng: 88.5122,
    zoom: 9,
    districts: ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim']
  },
  {
    code: 'JK',
    name: 'Jammu & Kashmir',
    capital: 'Srinagar / Jammu',
    lat: 33.7782,
    lng: 76.5762,
    zoom: 7,
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Rajouri']
  },
  {
    code: 'LA',
    name: 'Ladakh',
    capital: 'Leh',
    lat: 34.1526,
    lng: 77.5771,
    zoom: 7,
    districts: ['Leh', 'Kargil']
  },
  {
    code: 'PY',
    name: 'Puducherry',
    capital: 'Puducherry',
    lat: 11.9416,
    lng: 79.8083,
    zoom: 11,
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    capital: 'Chandigarh',
    lat: 30.7333,
    lng: 76.7794,
    zoom: 12,
    districts: ['Chandigarh']
  },
  {
    code: 'AN',
    name: 'Andaman and Nicobar',
    capital: 'Port Blair',
    lat: 11.7401,
    lng: 92.6586,
    zoom: 8,
    districts: ['South Andaman', 'North and Middle Andaman', 'Nicobar']
  }
];

export const INDIA_NATIONAL_CENTER = {
  lat: 22.5937,
  lng: 78.9629,
  zoom: 5
};

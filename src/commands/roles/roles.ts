export const roles = [
  { name: 'JS', value: '784372456219344906' },
  { name: 'PHP', value: '784372511868452915' },
  { name: 'Rust', value: '784372573323657226' },
  { name: 'Golang', value: '784372802135392286' },
  { name: 'GraphQL', value: '784372887196008448' },
  { name: 'Container', value: '784373009447518208' },
  { name: 'Wibu', value: '784373902549057566' },
  { name: 'Infrastructure', value: '784606353502896188' },
  { name: 'Hardware', value: '784606551733305384' },
  { name: 'Python', value: '784607321522831380' },
  { name: 'GaMeR', value: '784643628668289034' },
  { name: 'AI/ML', value: '784713878030385192' },
  { name: 'MechanicalKeyboard', value: '784728735277776908' },
  { name: 'Hackerman', value: '784890300627025921' },
  { name: 'C#', value: '785730876499165205' },
  { name: 'Thích Va Chạm', value: '813721446743933008' },
  { name: 'DJ', value: '816844139328045087' },
  { name: 'DOTA', value: '821148230712033280' },
  { name: 'LoL', value: '821148302094893057' },
  { name: 'Mobile', value: '824577374901239820' },
  { name: 'VIC', value: '826095206289375283' },
  { name: 'NSW', value: '826095237888999484' },
  { name: 'TAS', value: '826095253534670930' },
  { name: 'SA', value: '826095272090271785' },
  { name: 'ACT', value: '826095281636376636' },
  { name: 'WA', value: '826095378029740142' },
  { name: 'QLD', value: '826095414319120384' },
  { name: 'NT', value: '826095428515921969' },
  { name: 'Overseas', value: '826095483889254480' },
  { name: 'Java', value: '827884923956101150' },
  { name: 'C++', value: '828452046248083467' },
  { name: 'DnD', value: '909601586450427974' },
  { name: 'UI/UX', value: '917267267266433026' },
  { name: 'Hội Thầy Thuốc Trẻ VAIT', value: '933213969563398244' },

  // { name: '@everyone', value: '784198833815027742' },
  // { name: 'Admin', value: '784198932799815703' },
  // { name: 'NO FAIL ADMIN', value: '916320249379450900' },
  // { name: 'Moderator', value: '854157458226282527' },
  // { name: 'VAIT Music bot', value: '889660176028803113' },
  // { name: 'Repo Finder', value: '900013527933267969' },
  // { name: 'vAIt', value: '943122664485191804' },
  // { name: 'BA/PM/PO', value: '970864651929796658' },
  // { name: 'Avrae', value: '990235161591443549' },
  // { name: 'Not Quite Nitro', value: '990991878277189664' },
  // { name: 'Tupperbox', value: '991541855672094803' },
  // { name: 'Jkiller Bot', value: '1025272909536690210' }
  // { name: 'Partners', value: '803605245485121568' },
  // { name: 'Meetup Speaker', value: '803605996701483038' },
  // { name: 'CodingMentor Staff', value: '811812986062503956' },
  // { name: 'Server Contributor', value: '811842015381028864' },
  // { name: 'Server Donor', value: '824803830155313182' },
  // { name: 'Muted', value: '826033443888562207' },
  // { name: 'SKYNET', value: '784557299125059584' },
  // { name: 'Server Booster', value: '784691951063924738' },
];

export const searchRoles = (term?: string, searchRoleList = roles) => {
  const cleanedTerm = term?.trim().toLowerCase();

  return searchRoleList
    .filter((role) =>
      cleanedTerm ? role.name.toLowerCase().includes(cleanedTerm) : true
    )
    .slice(0, 25);
};

// 팀원 이메일 목록 — 여기에 추가하면 쓰기 권한 자동 부여
export const TEAM_EMAILS = [
  'unipjh04@gmail.com',
  'yoonseo774903@gmail.com',
  'arskhive@gmail.com',
  'yerinlee0922@gmail.com'
]

export function isTeamMember(user) {
  if (!user) return false
  return TEAM_EMAILS.includes(user.email)
}

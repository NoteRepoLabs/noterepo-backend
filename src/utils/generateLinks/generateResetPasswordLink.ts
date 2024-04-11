export function generateResetPasswordLink(id: string) {
  return `${process.env.RESET_PASSWORD_LINK}?userId=${id}`;
}

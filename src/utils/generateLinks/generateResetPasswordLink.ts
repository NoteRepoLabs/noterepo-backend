export function generateResetPasswordLink(id: string) {
  return `${process.env.RESET_PASSWORD_PAGE}?userId=${id}`;
}

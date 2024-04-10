export function generateWelcomeLink(id: string) {
  return `${process.env.WELCOME_LINK}/${id}`;
}

export function generateLink(link: string) {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${process.env.PORT}/api/v1/auth/verifyAccount/${link}`;
  } else {
    return `https://noterepo.onrender.com/api/v1/auth/verifyAccount/${link}`;
  }
}

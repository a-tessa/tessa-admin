const ACCESS_TOKEN_KEY = 'tessa-admin/access-token'

function hasWindow() {
  return typeof window !== 'undefined'
}

export function readStoredAccessToken() {
  if (!hasWindow()) {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function writeStoredAccessToken(accessToken: string) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function clearStoredAccessToken() {
  if (!hasWindow()) {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}

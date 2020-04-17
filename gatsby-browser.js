import './src/styles/global.scss'
import './src/styles/custom-code-buttons.scss'
import { Cookies } from 'react-cookie-consent'
import ReactGA from 'react-ga'

let initialized = false
export const onRouteUpdate = ({ location }, pluginOptions = {}) => {
  if (Cookies.get('CookieConsent') === `true` && !initialized) {
    ReactGA.initialize('UA-163801125-1')
    initialized = true
  }
  if (Cookies.get('CookieConsent') === `true` && initialized) {
    ReactGA.set({ page: location.pathname, anonymizeIp: true })
    ReactGA.pageview(location.pathname)
  }
}

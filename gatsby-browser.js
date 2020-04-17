import './src/styles/global.scss'
import './src/styles/custom-code-buttons.scss'
import { Cookies } from 'react-cookie-consent'
import ReactGA from 'react-ga'

export const onClientEntry = (_, pluginOptions = {}) => {
  console.log('onClientEntry------------------------------------------')
  console.log('CookieConsent', Cookies.get('CookieConsent'))
  if (Cookies.get('CookieConsent')) {
    if (!Cookies.get('_ga')) {
      ReactGA.initialize('UA-163801125-1')
      console.log('initialized', Cookies.get())
    }
  }
}
export const onRouteUpdate = ({ location }, pluginOptions = {}) => {
  if (Cookies.get('CookieConsent') === `true` && ReactGA.ga) {
    console.log('track me', location.pathname)
    ReactGA.set({ page: location.pathname })
    ReactGA.pageview(location.pathname)
  }
}

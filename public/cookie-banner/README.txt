Consent Manager Installation Instructions

1. Extract the contents of this zip file
2. Place the files in your website directory
3. Add the following code to your HTML page, inside the <head> tag:

<link rel="stylesheet" id="silktide-consent-manager-css" href="path-to-css/silktide-consent-manager.css">
<script src="path-to-js/silktide-consent-manager.js"></script>
<script>
silktideCookieBannerManager.updateCookieBannerConfig({
  background: {
    showBackground: true
  },
  cookieIcon: {
    position: "bottomLeft"
  },
  cookieTypes: [
    {
      id: "necess_ries",
      name: "Necessàries",
      description: "<p>Aquestes galetes són necessàries perquè el lloc web funcioni correctament i no es poden desactivar. Ajuden en tasques com iniciar sessió i establir les teves preferències de privadesa.</p>",
      required: true,
      onAccept: function() {
        console.log('Add logic for the required Necessàries here');
      }
    },
    {
      id: "anal_tiques",
      name: "Analítiques",
      description: "<p>Aquestes galetes ens ajuden a millorar el lloc rastrejant quines pàgines són més populars i com es mouen els visitants pel lloc.</p>",
      required: false,
      onAccept: function() {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
        dataLayer.push({
          'event': 'consent_accepted_anal_tiques',
        });
      },
      onReject: function() {
        gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    },
    {
      id: "publicitat",
      name: "Publicitat",
      description: "<p>Aquestes galetes ofereixen funcions addicionals i personalització per millorar la teva experiència. Poden ser establertes per nosaltres o per socis dels quals utilitzem els serveis.</p>",
      required: false,
      onAccept: function() {
        gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
        dataLayer.push({
          'event': 'consent_accepted_publicitat',
        });
      },
      onReject: function() {
        gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    }
  ],
  text: {
    banner: {
      description: "<p>Utilitzem galetes al nostre lloc per millorar la teva experiència d’usuari, oferir contingut personalitzat i analitzar el nostre trànsit. <a href=\"https://your-website.com/cookie-policy\" target=\"_blank\">Política de&nbsp;<a href=\"https://your-website.com/cookie-policy\" target=\"_blank\" style=\"background-color: rgb(255, 255, 255); font-family: sans-serif; font-weight: 400; letter-spacing: 0.34px;\">Cookie</a>.</a></p>",
      acceptAllButtonText: "Accepta-ho tot",
      acceptAllButtonAccessibleLabel: "Accepta totes les cookies",
      rejectNonEssentialButtonText: "Rebutja les no essencials",
      rejectNonEssentialButtonAccessibleLabel: "Rebutja les no essencials",
      preferencesButtonText: "Preferències",
      preferencesButtonAccessibleLabel: "Canvia les preferències"
    },
    preferences: {
      title: "Personalitza les teves preferències de Cookies",
      description: "<p>Respectem el teu dret a la privadesa. Pots triar no permetre alguns tipus de galetes. Les teves preferències de galetes s’aplicaran a tot el nostre lloc web.</p>",
      creditLinkText: "Obtingues aquest bàner de manera gratuïta",
      creditLinkAccessibleLabel: "Obtingues aquest bàner de manera gratuïta"
    }
  },
  position: {
    banner: "bottomCenter"
  }
});
</script>

import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa'

export default function FooterShop() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-shop">
      <div className="footer-shop__container">
        <div className="footer-shop__grid">
          {/* Columna 1: Logo y descripción */}
          <div className="footer-shop__brand">
            <p className="footer-shop__brand-logo text-primary">
              Serralleria Solidària
            </p>
            <p className="footer-shop__brand-description">
              La primera serralleria solidària amb la nostra societat. Els millors professionals al teu servei.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div className="footer-shop__links">
            <h3>Enllaços</h3>
            <ul>
              <li>
                <Link to="/">Inici</Link>
              </li>
              <li>
                <Link to="/products">Productes</Link>
              </li>
              <li>
                <Link to="/categories">Categories</Link>
              </li>
              <li>
                <a href="https://serralleriasolidaria.cat/nosaltres.php" target="_blank" rel="noopener noreferrer">Qui som</a>
              </li>
              <li>
                <a href="https://serralleriasolidaria.cat/serveis.php" target="_blank" rel="noopener noreferrer">Serveis</a>
              </li>
              <li>
                <a href="https://serralleriasolidaria.cat/solidaritat.php" target="_blank" rel="noopener noreferrer">Solidaritat</a>
              </li>
              <li>
                <a href="https://web.gencat.cat/ca/generalitat/com-ens-organitzem/adreces-i-telefons/detall-adreces-i-telefons?objectID=5679" target="_blank" rel="noopener noreferrer">Estem Adherits</a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información de contacto */}
          <div className="footer-shop__contact">
            <h3>Contacte</h3>
            <ul>
              <li>
                <span>Telèfon:</span> +34 600 500 517
              </li>
              <li>
                <span className="link">Email:</span> <a href="mailto:empresa@serralleriasolidaria.cat">empresa@serralleriasolidaria.cat</a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes sociales */}
          <div className="footer-shop__social">
            <h3>Segueix-nos</h3>
            <div className="footer-shop__social-icons">
              <a href="https://www.facebook.com/serralleriasolidaria/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://www.instagram.com/serralleria_solidaria/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://twitter.com/serralsolidaria" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://es.linkedin.com/company/serralleria-solid%C3%A0ria-s-l-u" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="https://www.youtube.com/channel/UCFhIQvRHGT4SG6bJcw6HWqw?view_as=subscriber" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-shop__bottom">
          <div className="footer-shop__bottom-links">
            <a href="https://serralleriasolidaria.cat/avislegal.php" target="_blank" rel="noopener noreferrer">Avís legal</a>
            <span className="footer-shop__bottom-separator">|</span>
            <a href="https://serralleriasolidaria.cat/privacitat.php" target="_blank" rel="noopener noreferrer">Política de privacitat</a>
            <span className="footer-shop__bottom-separator">|</span>
            <a href="https://serralleriasolidaria.cat/cookies.php" target="_blank" rel="noopener noreferrer">Política de galetes</a>
          </div>
          <p>© {currentYear} Serralleria Solidària. Tots els drets reservats.</p>
        </div>
      </div>
    </footer>
  )
}
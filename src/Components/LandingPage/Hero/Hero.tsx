import { FaArrowRight } from "react-icons/fa";
import "./style.css";

export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-text-wrapper">
          <h1 className="hero-title">
            Усі заявки - <br />в одному місці.
          </h1>
          <p className="hero-text">
            Приймайте заявки з сайту, керуйте клієнтами та заявками в одній CRM.
          </p>
          <button className="hero-button button-try">
            <p>Почати безкоштовно</p>
            <FaArrowRight />
          </button>
          <p className="hero-button-underbutton-text">
            Не маєте розробника? Не проблема. <br /> Допоможемо підключити Lentra до
            вашого сайту та налаштувати все необхідне для прийому заявок.
          </p>
        </div>
        <div className="hero-img">

        </div>
      </div>
    </section>
  );
}

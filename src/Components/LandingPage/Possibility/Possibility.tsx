import { IoAnalytics } from "react-icons/io5";
import "./style.css";

import {
  MdInbox,
  MdPeople,
  MdTune,
  MdNotifications,
  MdCode,
} from "react-icons/md";

const NAV_ITEMS = [
  {
    id: "requests",
    icon: <MdInbox />,
    label: "Заявки",
    description: "Збирайте всі заявки з ваших сайтів в одному місці.",
  },
  {
    id: "clients",
    icon: <MdPeople />,
    label: "Клієнти",
    description: "Керуйте даними клієнтів та зберігайте історію взаємодії.",
  },
  {
    id: "analytics",
    icon: <IoAnalytics />,
    label: "Аналітика",
    description: "Відстежуйте кількість заявок та ефективність їх обробки.",
  },
  {
    id: "statuses",
    icon: <MdTune />,
    label: "Статуси",
    description: "Налаштовуйте статуси відповідно до вашого робочого процесу.",
  },
  {
    id: "notifications",
    icon: <MdNotifications />,
    label: "Сповіщення",
    description: "Миттєво дізнавайтеся про нові заявки та зміни.",
  },
  {
    id: "api",
    icon: <MdCode />,
    label: "API",
    description: "Інтегруйте Lentra з будь-яким сайтом або власним сервісом.",
  },
];

export function Possibility() {
  return (
    <section className="possibility" id="possibility">
      <div className="container">
        <h2 className="section-title">Можливості</h2>
        <div className="possibility-cards">
          {NAV_ITEMS.map((el, i) => (
            <div className="possibility-card" key={i}>
              <div className="possibility-card-icon">{el.icon}</div>
              <h2 className="possibility-card-title">{el.label}</h2>
              <p className="possibility-card-text">{el.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

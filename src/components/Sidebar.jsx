import { useEffect, useRef, useState } from "react";
import logoMark from "../assets/rocketridev1.svg";

const iconUrl = (name) =>
  `https://unpkg.com/pixelarticons@1.8.0/svg/${name}.svg`;

const icons = {
  collapse: iconUrl("chevron-left"),
  expand: iconUrl("chevron-right"),
  home: iconUrl("home"),
  project: iconUrl("file"),
  feedback: iconUrl("chat"),
  changelog: iconUrl("list"),
  help: iconUrl("info-box"),
  keys: iconUrl("code"),
  user: iconUrl("user"),
};

const navItems = [
  { id: "home", label: "Home", icon: icons.home },
  { id: "projects", label: "Projects", icon: icons.project },
];

const footerItems = [
  { id: "feedback", label: "Feedback", icon: icons.feedback },
  { id: "changelog", label: "Changelog", icon: icons.changelog },
];

const utilityItems = [
  { id: "help", label: "Help", icon: icons.help },
  { id: "api-keys", label: "API Keys", icon: icons.keys },
];

export default function Sidebar({ activeView, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const helpRef = useRef(null);
  const profileRef = useRef(null);
  const resolvedActive =
    activeView === "project-canvas" ? "projects" : activeView;
  
  // Get user initials (default to "LA" for now)
  const getUserInitials = () => {
    const userName = "User Name"; // This could come from props or context
    const parts = userName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClick = (event) => {
      const clickedHelp = helpRef.current?.contains(event.target);
      const clickedProfile = profileRef.current?.contains(event.target);

      if (clickedHelp || clickedProfile) {
        return;
      }
      setHelpOpen(false);
      setProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className={`rr-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="rr-sidebar__top">
        <div className="rr-sidebar__brand">
          <div className="rr-sidebar__logo-wrapper">
            <img src={logoMark} alt="RocketRide" className="rr-sidebar__logo" />
          </div>
          <span className="rr-sidebar__brand-text">RocketRide</span>
        </div>
        <button
          className="rr-icon-button rr-sidebar__toggle"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <img
            src={collapsed ? icons.expand : icons.collapse}
            alt=""
            className="rr-icon-image"
          />
        </button>
      </div>

      <nav className="rr-sidebar__nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className="rr-sidebar__item-wrapper"
            onMouseEnter={() => collapsed && setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              type="button"
               className={`rr-sidebar__item ${
                 resolvedActive === item.id ? "is-active" : ""
               }`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="rr-icon">
                <img src={item.icon} alt="" className="rr-icon-image" />
              </span>
              <span className="rr-sidebar__item-label">{item.label}</span>
            </button>
            {collapsed && hoveredItem === item.id && (
              <div className="rr-sidebar__tooltip">{item.label}</div>
            )}
          </div>
        ))}
      </nav>

      <div className="rr-sidebar__footer">
        <div className="rr-sidebar__section-divider" />
        <div className="rr-sidebar__group">
          {footerItems.map((item) => (
            <div
              key={item.id}
              className="rr-sidebar__item-wrapper"
              onMouseEnter={() => collapsed && setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                type="button"
                 className={`rr-sidebar__item ${
                   resolvedActive === item.id ? "is-active" : ""
                 }`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="rr-icon">
                  <img src={item.icon} alt="" className="rr-icon-image" />
                </span>
                <span className="rr-sidebar__item-label">{item.label}</span>
              </button>
              {collapsed && hoveredItem === item.id && (
                <div className="rr-sidebar__tooltip">{item.label}</div>
              )}
            </div>
          ))}
        </div>

        <div className="rr-sidebar__group">
          <div className="rr-sidebar__help" ref={helpRef}>
            <div
              className="rr-sidebar__item-wrapper"
              onMouseEnter={() => collapsed && setHoveredItem("help")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                type="button"
                className="rr-sidebar__item"
                onClick={() => setHelpOpen((value) => !value)}
              >
                <span className="rr-icon">
                  <img src={icons.help} alt="" className="rr-icon-image" />
                </span>
                <span className="rr-sidebar__item-label">Help</span>
              </button>
              {collapsed && hoveredItem === "help" && (
                <div className="rr-sidebar__tooltip">Help</div>
              )}
            </div>
            {helpOpen && (
              <div className="rr-sidebar__popover">
                <button
                  type="button"
                  className="rr-sidebar__popover-item"
                  onClick={() => {
                    onNavigate("design-system");
                    setHelpOpen(false);
                  }}
                >
                  Design System
                </button>
              </div>
            )}
          </div>
          {utilityItems
            .filter((item) => item.id !== "help")
            .map((item) => (
              <div
                key={item.id}
                className="rr-sidebar__item-wrapper"
                onMouseEnter={() => collapsed && setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  type="button"
                 className={`rr-sidebar__item ${
                   resolvedActive === item.id ? "is-active" : ""
                 }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="rr-icon">
                    <img src={item.icon} alt="" className="rr-icon-image" />
                  </span>
                  <span className="rr-sidebar__item-label">{item.label}</span>
                </button>
                {collapsed && hoveredItem === item.id && (
                  <div className="rr-sidebar__tooltip">{item.label}</div>
                )}
              </div>
            ))}
        </div>

        <div className="rr-sidebar__section-divider" />
        <div className="rr-sidebar__user-popover" ref={profileRef}>
          <button
            type="button"
            className="rr-sidebar__user"
            onClick={() => setProfileOpen((value) => !value)}
          >
            <span className="rr-icon rr-icon--outlined rr-icon--initials">
              <span className="rr-icon__initials">{getUserInitials()}</span>
            </span>
            <div className="rr-sidebar__user-meta">
              <span className="rr-sidebar__user-name">User Name</span>
              <span className="rr-sidebar__user-plan">Free Plan</span>
            </div>
          </button>
          {profileOpen && (
            <div className="rr-sidebar__popover rr-sidebar__popover--profile">
              <button type="button" className="rr-sidebar__popover-item">
                Profile
              </button>
              <button type="button" className="rr-sidebar__popover-item">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

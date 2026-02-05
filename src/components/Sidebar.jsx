import { useEffect, useRef, useState } from "react";
import logoMark from "../assets/rocketridev1.svg";

/**
 * SIDEBAR NAVIGATION COMPONENT
 * 
 * This component provides a collapsible sidebar navigation menu with the following features:
 * - Main navigation items (top section)
 * - Footer items (middle section)
 * - Utility items with popovers (bottom section)
 * - Theme selector with popover
 * - User profile section
 * - Tooltips when collapsed
 * - Responsive collapse/expand functionality
 * 
 * STRUCTURE:
 * 1. Top: Logo + Brand text + Toggle button
 * 2. Nav: Main navigation items (Home, Projects, etc.)
 * 3. Footer: 
 *    - Section divider
 *    - Footer items (Feedback, Changelog)
 *    - Utility items (Help with popover, API Keys)
 *    - Theme selector with popover
 *    - Section divider
 *    - User profile with popover
 * 
 * HOW TO ADD NEW NAVIGATION ITEMS:
 * 
 * 1. Add a new icon to the icons object:
 *    const icons = {
 *      ...existing icons,
 *      newItem: iconUrl("icon-name"), // Use pixelarticons icon name
 *    };
 * 
 * 2. Add item to appropriate array:
 *    - navItems: Main navigation (top section)
 *    - footerItems: Footer section items
 *    - utilityItems: Utility section items
 * 
 * 3. Item format:
 *    { id: "unique-id", label: "Display Name", icon: icons.iconName }
 * 
 * 4. The item will automatically:
 *    - Show icon and label when expanded
 *    - Show tooltip on hover when collapsed
 *    - Handle active state based on activeView prop
 *    - Navigate via onNavigate callback
 * 
 * HOW TO ADD A POPOVER (like Help or Theme):
 * 
 * 1. Add state: const [popoverOpen, setPopoverOpen] = useState(false);
 * 2. Add ref: const popoverRef = useRef(null);
 * 3. Add to click handler in useEffect
 * 4. Wrap item in container with ref
 * 5. Add conditional popover div with className "rr-sidebar__popover"
 * 
 * See the Help section (lines 174-208) or Theme section (lines 237-288) for examples.
 */

// Icon URL helper - generates URLs for pixelarticons library
const iconUrl = (name) =>
  `https://unpkg.com/pixelarticons@1.8.0/svg/${name}.svg`;

// Icon definitions - add new icons here as needed
// Available icons: https://pixelarticons.com/
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
  palette: iconUrl("paint-bucket"),
};

// MAIN NAVIGATION ITEMS
// These appear in the top section of the sidebar
// Format: { id: "route-id", label: "Display Name", icon: icons.iconName }
// The id should match the route/view identifier passed to onNavigate
const navItems = [
  { id: "home", label: "Home", icon: icons.home },
  { id: "projects", label: "Projects", icon: icons.project },
];

// FOOTER ITEMS
// These appear in the middle footer section (below main nav, above utilities)
// Same format as navItems
const footerItems = [
  { id: "feedback", label: "Feedback", icon: icons.feedback },
  { id: "changelog", label: "Changelog", icon: icons.changelog },
];

// UTILITY ITEMS
// These appear in the utility section (below footer items)
// Note: "help" is handled separately with a popover, so it's filtered out here
const utilityItems = [
  { id: "help", label: "Help", icon: icons.help },
  { id: "api-keys", label: "API Keys", icon: icons.keys },
];

// THEME OPTIONS
// Used by the theme selector popover
// Format: { id: "theme-id", label: "Theme Name", meta: "Description" }
const themeOptions = [
  {
    id: "tungsten",
    label: "Tungsten",
    meta: "Warm industrial glow",
  },
  {
    id: "singularity",
    label: "Singularity",
    meta: "Focused energy axis",
  },
  {
    id: "orbital",
    label: "Orbital Systems",
    meta: "Diagrammatic calm",
  },
  {
    id: "interstellar",
    label: "Interstellar",
    meta: "Charcoal core, solar flare",
  },
];

/**
 * Sidebar Component
 * 
 * @param {string} activeView - The currently active view/route identifier
 * @param {function} onNavigate - Callback function called when navigation items are clicked
 *                                Receives the item id as parameter: onNavigate(itemId)
 * @param {string} theme - Current theme identifier
 * @param {function} onThemeChange - Callback function called when theme is changed
 *                                   Receives the theme id as parameter: onThemeChange(themeId)
 */
export default function Sidebar({ activeView, onNavigate, theme, onThemeChange }) {
  // STATE MANAGEMENT
  
  // Collapsed state - controls whether sidebar is collapsed (icons only) or expanded (full width)
  const [collapsed, setCollapsed] = useState(false);
  
  // Popover states - control visibility of dropdown menus
  const [helpOpen, setHelpOpen] = useState(false);      // Help popover (Design System link)
  const [profileOpen, setProfileOpen] = useState(false); // User profile popover
  const [themeOpen, setThemeOpen] = useState(false);    // Theme selector popover
  
  // Tooltip state - tracks which item is hovered when collapsed (for tooltip display)
  const [hoveredItem, setHoveredItem] = useState(null); // Set to item.id when hovered
  
  // Refs for popover containers - used to detect clicks outside to close popovers
  const helpRef = useRef(null);
  const profileRef = useRef(null);
  const themeRef = useRef(null);
  
  // Resolve active view - handles special case where "project-canvas" should highlight "projects"
  const resolvedActive =
    activeView === "project-canvas" ? "projects" : activeView;
  
  // Find current active theme object for display
  const activeTheme = themeOptions.find((option) => option.id === theme);
  
  /**
   * Get user initials from name
   * Extracts first letter of first name + first letter of last name
   * Falls back to first 2 characters if only one name provided
   * 
   * TODO: Replace hardcoded "User Name" with actual user data from props/context
   */
  const getUserInitials = () => {
    const userName = "User Name"; // This could come from props or context
    const parts = userName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  /**
   * CLICK OUTSIDE HANDLER
   * Closes popovers when clicking outside their containers
   * 
   * This effect:
   * 1. Listens for mousedown events on the document
   * 2. Checks if the click was inside any popover container (using refs)
   * 3. If click was outside, closes all popovers
   * 
   * To add a new popover:
   * 1. Add a ref: const newPopoverRef = useRef(null);
   * 2. Add ref to container: <div ref={newPopoverRef}>
   * 3. Add check: const clickedNew = newPopoverRef.current?.contains(event.target);
   * 4. Add to condition: if (clickedHelp || clickedProfile || clickedTheme || clickedNew)
   * 5. Add to close: setNewPopoverOpen(false);
   */
  useEffect(() => {
    const handleClick = (event) => {
      const clickedHelp = helpRef.current?.contains(event.target);
      const clickedProfile = profileRef.current?.contains(event.target);
      const clickedTheme = themeRef.current?.contains(event.target);

      if (clickedHelp || clickedProfile || clickedTheme) {
        return;
      }
      setHelpOpen(false);
      setProfileOpen(false);
      setThemeOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className={`rr-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      {/* TOP SECTION: Logo + Brand + Toggle Button */}
      <div className="rr-sidebar__top">
        <div className="rr-sidebar__brand">
          {/* Logo wrapper - provides frame when collapsed (46px × 46px) */}
          <div className="rr-sidebar__logo-wrapper">
            <img src={logoMark} alt="RocketRide" className="rr-sidebar__logo" />
          </div>
          {/* Brand text - hidden when collapsed */}
          <span className="rr-sidebar__brand-text">RocketRide</span>
        </div>
        {/* Toggle button - collapses/expands sidebar */}
        {/* When collapsed, this button appears centered on logo on hover */}
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

      {/* MAIN NAVIGATION SECTION */}
      {/* 
        This section renders the main navigation items (Home, Projects, etc.)
        
        STRUCTURE:
        - Each item is wrapped in rr-sidebar__item-wrapper for tooltip positioning
        - Button has rr-sidebar__item class + "is-active" when active
        - Icon and label are inside the button
        - Tooltip appears when collapsed and item is hovered
        
        TO ADD A NEW NAV ITEM:
        1. Add to navItems array at top of file
        2. Item will automatically render here with all functionality
      */}
      <nav className="rr-sidebar__nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className="rr-sidebar__item-wrapper"
            // Tooltip hover handlers - only active when collapsed
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
            {/* Tooltip - shows label when collapsed and hovered */}
            {collapsed && hoveredItem === item.id && (
              <div className="rr-sidebar__tooltip">{item.label}</div>
            )}
          </div>
        ))}
      </nav>

      {/* FOOTER SECTION: Footer items, utilities, theme, user */}
      <div className="rr-sidebar__footer">
        <div className="rr-sidebar__section-divider" />
        
        {/* FOOTER ITEMS GROUP */}
        {/* 
          Footer items (Feedback, Changelog, etc.)
          Same structure as nav items - simple navigation buttons
        */}
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

        {/* UTILITY ITEMS GROUP */}
        {/* 
          Utility items with special behaviors:
          - Help: Has a popover dropdown (see below)
          - Other utilities: Simple navigation items
          
          Note: Help is filtered out from utilityItems because it's handled separately
        */}
        <div className="rr-sidebar__group">
          {/* HELP ITEM WITH POPOVER */}
          {/* 
            Example of how to add a popover to a sidebar item:
            1. Wrap in container with ref for click-outside detection
            2. Button toggles popover state
            3. Conditional render of popover div
            4. Popover contains action items
          */}
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
            {/* Popover dropdown - appears when helpOpen is true */}
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
                {/* Add more popover items here as needed */}
              </div>
            )}
          </div>
          
          {/* OTHER UTILITY ITEMS */}
          {/* 
            Renders utility items except "help" (which is handled above)
            These are simple navigation items without popovers
          */}
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

        {/* THEME SELECTOR WITH POPOVER */}
        {/* 
          Another example of a popover implementation
          Shows current theme and allows selection from themeOptions
          
          Features:
          - Shows current theme label when expanded
          - Opens popover with theme options on click
          - Each option shows a color swatch and description
          - Active theme is highlighted
        */}
        <div className="rr-sidebar__theme" ref={themeRef}>
          <div
            className="rr-sidebar__item-wrapper"
            onMouseEnter={() => collapsed && setHoveredItem("theme")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              type="button"
              className="rr-sidebar__item rr-sidebar__theme-trigger"
              onClick={() => setThemeOpen((value) => !value)}
              aria-expanded={themeOpen}
              aria-haspopup="true"
            >
              <span className="rr-icon">
                <img src={icons.palette} alt="" className="rr-icon-image" />
              </span>
              <span className="rr-sidebar__item-label">Theme</span>
              {/* Current theme label - hidden when collapsed */}
              <span className="rr-sidebar__theme-value">
                {activeTheme?.label ?? "Theme"}
              </span>
            </button>
            {collapsed && hoveredItem === "theme" && (
              <div className="rr-sidebar__tooltip">Theme</div>
            )}
          </div>
          {/* Theme popover - shows theme options */}
          {themeOpen && (
            <div className="rr-sidebar__popover rr-sidebar__popover--theme">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`rr-sidebar__theme-option ${
                    theme === option.id ? "is-active" : ""
                  }`}
                  onClick={() => {
                    onThemeChange(option.id);
                    setThemeOpen(false);
                  }}
                >
                  {/* Color swatch - styled via CSS data-theme attribute */}
                  <span
                    className="rr-sidebar__theme-swatch"
                    data-theme={option.id}
                  />
                  <span className="rr-sidebar__theme-text">
                    <span className="rr-sidebar__theme-name">{option.label}</span>
                    <span className="rr-sidebar__theme-meta">{option.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rr-sidebar__section-divider" />
        
        {/* USER PROFILE SECTION */}
        {/* 
          User profile button with popover
          
          Features:
          - Shows user initials in a circular badge (gradient background)
          - Shows user name and plan when expanded
          - Opens popover with profile actions when clicked
          - Popover positioned above the button
        */}
        <div className="rr-sidebar__user-popover" ref={profileRef}>
          <button
            type="button"
            className="rr-sidebar__user"
            onClick={() => setProfileOpen((value) => !value)}
          >
            {/* User initials badge - always visible */}
            <span className="rr-icon rr-icon--outlined rr-icon--initials">
              <span className="rr-icon__initials">{getUserInitials()}</span>
            </span>
            {/* User metadata - hidden when collapsed */}
            <div className="rr-sidebar__user-meta">
              <span className="rr-sidebar__user-name">User Name</span>
              <span className="rr-sidebar__user-plan">Free Plan</span>
            </div>
          </button>
          {/* Profile popover - appears above button */}
          {profileOpen && (
            <div className="rr-sidebar__popover rr-sidebar__popover--profile">
              <button type="button" className="rr-sidebar__popover-item">
                Profile
              </button>
              <button type="button" className="rr-sidebar__popover-item">
                Sign out
              </button>
              {/* Add more profile actions here */}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

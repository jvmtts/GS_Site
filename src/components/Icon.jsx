const shapes = {
    arrow: <><path d="M4 12h16M13 5l7 7-7 7"/></>,
    back: <><path d="M20 12H4m7 7-7-7 7-7"/></>,
    external: <><path d="M13 5h6v6M19 5l-9 9"/><path d="M19 13v6H5V5h6"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.6 20c.5-3.7 3.1-5.6 7.4-5.6s6.9 1.9 7.4 5.6"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z"/>,
    book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1V6z"/></>,
    layers: <><path d="m12 2 10 6-10 6L2 8l10-6Zm-10 11 10 6 10-6M2 17l10 6 10-6"/></>,
    cap: <><path d="m2 8 10-5 10 5-10 5-10-5zM6 10v7c3 3 9 3 12 0v-7m4-2v9"/></>,
    check: <path d="m5 12 5 5 9-10"/>,
    close: <path d="M5 5l14 14M19 5 5 19"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/></>,
    coins: <><ellipse cx="10" cy="6" rx="7" ry="3"/><path d="M3 6v5c0 1.7 3.1 3 7 3 1.8 0 3.4-.3 4.6-.8M3 11v5c0 1.7 3.1 3 7 3m5-9c3.6 0 6 1 6 3v5c0 1.7-3 3-7 3-2.2 0-4.1-.4-5.3-1"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M2 19c0-4 2-6 7-6s7 2 7 6M18 6a3 3 0 0 1 0 6M19 14c2 1 3 3 3 5"/></>,
    building: <><path d="m2 9 10-6 10 6H2zM4 20h16M6 10v10M10 10v10M14 10v10M18 10v10"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>,
    chart: <><path d="M4 20h16M6 17v-5h3v5m3 0V5h3v12m3 0V9h3v8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    edit: <><path d="m4 20 5-.8L20 8l-4-4L5 15 4 20zM13 7l4 4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>,
    share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.5 10.8 7-4.5m-7 7 7 4.5"/></>,
};
export default function Icon({ name = 'arrow', size = 20, className = '', ...props }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {shapes[name] || shapes.info}
    </svg>
  );
}

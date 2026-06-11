document.addEventListener('DOMContentLoaded', () => {
    const btnMenu = document.getElementById('btn-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');

    if (btnMenu && mobileMenu && backdrop) {
        const toggleMenu = () => {
            const isClosed = mobileMenu.classList.contains('-translate-x-full');
            if (isClosed) {
                mobileMenu.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            }
        };

        btnMenu.addEventListener('click', toggleMenu);
        backdrop.addEventListener('click', toggleMenu);
    }
});

import Modal from 'bootstrap/js/dist/modal';
import Tab from 'bootstrap/js/dist/tab';
import feather from 'feather-icons';
import './generator.js';

window.bootstrap = { Modal };

// src/scripts/main.js

/**
 * chkr.cc main.js - Vanilla JS refactor
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Enable Bootstrap tabs (minimal module import)
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach((triggerEl) => {
        const tab = Tab.getOrCreateInstance(triggerEl);
        triggerEl.addEventListener('click', (e) => {
            e.preventDefault();
            tab.show();
        });
    });

    // Enable Bootstrap modals for data attributes
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach((triggerEl) => {
        triggerEl.addEventListener('click', (e) => {
            const target = triggerEl.getAttribute('data-bs-target');
            if (!target) return;
            const modalEl = document.querySelector(target);
            if (!modalEl) return;
            e.preventDefault();
            Modal.getOrCreateInstance(modalEl).show();
        });
    });

    // 1. Domain Check
    function checkDomain() {
        const allowedDomain = 'chkr.cc';
        const currentDomain = window.location.hostname;
        
        if (currentDomain !== allowedDomain && currentDomain !== 'localhost' && currentDomain !== '127.0.0.1') {
            window.location.href = `https://${allowedDomain}`;
        }
    }
    checkDomain();

    // 2. Feather Icons Activation
    feather.replace();

    // 3. Populate Year Dropdown (for BIN Generator)
    function populateYearDropdown() {
        const yearSelect = document.getElementById('year');
        if (yearSelect && yearSelect.options.length <= 1) {
            const currentYear = new Date().getFullYear();
            for (let i = 0; i <= 10; i++) {
                const year = currentYear + i;
                const option = new Option(year, year);
                yearSelect.add(option);
            }
        }
    }

    // Populate Month Dropdown
    function populateMonthDropdown() {
        const monthSelect = document.getElementById('month');
        if (monthSelect && monthSelect.options.length <= 1) {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            for (let i = 0; i < months.length; i++) {
                const monthNum = String(i + 1).padStart(2, '0');
                const option = new Option(months[i], monthNum);
                monthSelect.add(option);
            }
        }
    }

    // Wait for modal to open, though we can populate immediately in vanilla JS 
    // depending on Bootstrap events. We will just populate them now.
    populateYearDropdown();
    populateMonthDropdown();

    // 4. Smooth Scrolling
    const smothLinks = document.querySelectorAll('.smoth-animation');
    smothLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offset = 50;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 5. Back to Top Button
    const scrollTopBtn = document.getElementById('backToTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.pointerEvents = 'none';
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Sticky Header
    const headerSticky = document.querySelector('.header--sticky');
    if (headerSticky) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 250) {
                headerSticky.classList.add('sticky');
            } else {
                headerSticky.classList.remove('sticky');
            }
        });
    }

    // 7. Mobile Menu Active
    const menuBtn = document.getElementById('menuBtn');
    const popupMobileMenu = document.getElementById('popupMobileMenu');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
    const closeHeaderBtn = document.getElementById('closeHeaderBtn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function openMobileMenu(e) {
        if(e) e.preventDefault();
        if(popupMobileMenu) popupMobileMenu.classList.add('menu-open');
        document.documentElement.style.overflow = 'hidden';
    }

    function closeMobileMenu(e) {
        if(e) e.preventDefault();
        if(popupMobileMenu) popupMobileMenu.classList.remove('menu-open');
        document.documentElement.style.overflow = '';
    }

    if (menuBtn) menuBtn.addEventListener('click', openMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
    if (closeHeaderBtn) closeHeaderBtn.addEventListener('click', closeMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    if (popupMobileMenu) {
        popupMobileMenu.addEventListener('click', (e) => {
            if (e.target === popupMobileMenu) {
                closeMobileMenu();
            }
        });
    }

    // 8. Copyright Year & Clipboard
    const copyrightElement = document.getElementById('copyright');
    if(copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `2022-${currentYear}`;
    }

    document.addEventListener('copy', function(e) {
        const selection = document.getSelection();
        if (selection) {
            const text = selection.toString();
            // Remove zero-width characters (SIGNATURE used in generator)
            const cleanText = text.replace(/[\u200B\u200C\u200D]/g, '');
            if (e.clipboardData) {
                e.clipboardData.setData('text/plain', cleanText);
                e.preventDefault();
            }
        }
    });

});

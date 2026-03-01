// src/scripts/generator.js

/**
 * chkr.cc generator.js - Vanilla JS Refactor
 * Card validation and BIN generation logic using modern JS.
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const SIGNATURE = "\u200B\u200C\u200B\u200D"; // Zero-width character signature
    let isExiting = false;

    // UI Elements
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const ccTextArea = document.getElementById('cc');

    // Modal & Progress Elements
    const progressModalEl = document.getElementById('progress-modal');
    // Using Bootstrap 5 JS API for Modals
    const progressModal = new bootstrap.Modal(progressModalEl, {
        backdrop: 'static',
        keyboard: false
    });



    const modalProgressBar = document.getElementById('modalProgressBar');
    const modalPercentLabel = document.getElementById('modalPercentLabel');
    const modalStopBtn = document.getElementById('modal-stop');

    // Stats Elements
    const liveResults = document.getElementById('liveResults');
    const dieResults = document.getElementById('dieResults');
    const unknownResults = document.getElementById('unknownResults');

    const liveBadge = document.querySelector('#live-tab span');
    const dieBadge = document.querySelector('#die-tab span');
    const unknownBadge = document.querySelector('#unknown-tab span');

    const liveCountModal = document.getElementById('live-count');
    const dieCountModal = document.getElementById('die-count');
    const unknownCountModal = document.getElementById('unknown-count');

    // Generator Elements
    const binInput = document.getElementById('bin');
    const cvvInput = document.getElementById('cvv');
    const qtyInput = document.getElementById('quantity');
    const monthSelect = document.getElementById('month');
    const yearSelect = document.getElementById('year');
    const genBtn = document.getElementById('gen');
    const binGeneratorModalEl = document.getElementById('bin-generator');

    // --- Core Checking Logic ---

    async function startChecking() {
        if (!ccTextArea.value.trim()) return;

        isExiting = false;
        startBtn.disabled = true;
        ccTextArea.disabled = true;

        stopBtn.disabled = false;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';

        progressModal.show();

        // Parse CCs
        // Filter out empty lines immediately
        const ccs = ccTextArea.value.split("\n").filter(line => line.trim() !== "");
        const useGate2 = false; // "gate2" was present in old HTML but display:none, porting over default behavior
        const timerDuration = useGate2 ? 4500 : 2500;

        for (let i = 0; i < ccs.length; i++) {
            if (isExiting) break;

            const currentCardStr = ccs[i];

            try {
                const response = await fetch("https://api.chkr.cc/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify({
                        data: currentCardStr,
                        charge: useGate2
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed with status: ${response.status}`);
                }

                const res = await response.json();
                handleCheckResult(res, currentCardStr, i, ccs.length);

            } catch (error) {
                console.error("Fetch Error: ", error);
                handleCheckError(error.message, currentCardStr, i, ccs.length);
            }

            removeFirstLineFromTextarea();

            if (i === ccs.length - 1 || isExiting) {
                finishChecking(i === ccs.length - 1);
                return;
            }

            // Wait before next check
            await new Promise(res => setTimeout(res, timerDuration));
        }
    }

    function handleCheckResult(res, cardStr, index, total) {
        const progressNum = ((index + 1) / total * 100).toFixed(2);
        const progressStr = `${progressNum}%`;

        let containerTarget = null;
        let badgeTarget = null;

        // Build message UI
        const emoji = res.card && res.card.country && res.card.country.emoji ? res.card.country.emoji : '🌍';
        const type = res.card && res.card.type ? res.card.type : 'Unknown';
        const category = res.card && res.card.category ? res.card.category : 'Unknown';
        const statusColor = res.status === 'Live' ? '#20b27c' : (res.status === 'Die' ? '#ff014f' : '#fce00c');
        const cardVal = res.card && res.card.card ? res.card.card : cardStr;

        const msgHtml = `<div><b style="color:${statusColor}">${res.status}</b> | ${cardVal} | [BIN: ${emoji} - ${type} - ${category}] | ${res.message}</div>`;

        switch (res.code) {
            case 0:
                containerTarget = dieResults;
                badgeTarget = dieBadge;
                break;
            case 1:
                containerTarget = liveResults;
                badgeTarget = liveBadge;
                break;
            case 2:
            default:
                containerTarget = unknownResults;
                badgeTarget = unknownBadge;
                break;
        }

        if (containerTarget) {
            containerTarget.insertAdjacentHTML('beforeend', msgHtml);
            badgeTarget.textContent = parseInt(badgeTarget.textContent) + 1;
        }

        updateProgressUI(progressStr);
    }

    function handleCheckError(errorMsg, cardStr, index, total) {
        const progressNum = ((index + 1) / total * 100).toFixed(2);
        const progressStr = `${progressNum}%`;

        const msgHtml = `<div><b style="color:#ff014f">Error</b> | ${cardStr} | ${errorMsg}</div>`;
        unknownResults.insertAdjacentHTML('beforeend', msgHtml);
        unknownBadge.textContent = parseInt(unknownBadge.textContent) + 1;

        updateProgressUI(progressStr);
    }

    function updateProgressUI(progressStr) {
        liveCountModal.textContent = liveBadge.textContent;
        dieCountModal.textContent = dieBadge.textContent;
        unknownCountModal.textContent = unknownBadge.textContent;

        modalProgressBar.style.width = progressStr;
        modalPercentLabel.textContent = progressStr;


    }

    function removeFirstLineFromTextarea() {
        let lines = ccTextArea.value.split('\n');
        lines.shift();
        ccTextArea.value = lines.join("\n");
    }

    function finishChecking(completedAll) {
        stopBtn.disabled = true;
        startBtn.disabled = false;
        ccTextArea.disabled = false;

        setTimeout(() => {
            progressModal.hide();
        }, 1200);

        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';

        if (completedAll) {
            ccTextArea.value = '';
        }
    }

    function stopChecking() {
        isExiting = true;
        progressModal.hide();

        stopBtn.disabled = true;
        startBtn.disabled = false;
        ccTextArea.disabled = false;

        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    }

    // Checking Event Listeners
    if (startBtn) startBtn.addEventListener('click', startChecking);
    if (stopBtn) stopBtn.addEventListener('click', stopChecking);
    if (modalStopBtn) modalStopBtn.addEventListener('click', stopChecking);

    // --- BIN Generator Logic ---

    function addPlaceholder() {
        let e = "";
        let t = binInput.value;
        if (t.length >= 6) {
            t = t.replace(/\s+/g, "");
            const tl = /^3/.test(t) ? 15 : 16;
            t = t.replace(/X/g, "x");
            t = t.replace(/[^0-9x]/g, "");
            for (let n = 0; n < tl - t.length; n++) e += "x";
            t += e;
        }
        return t;
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function validateLuhn(cardNumber) {
        let sum = 0;
        let isEven = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isEven = !isEven;
        }
        return (sum % 10) === 0;
    }

    function makeCC() {
        const template = addPlaceholder();
        for (let attempt = 0; attempt < 500; attempt++) {
            let cardNumber = template.split('').map(char =>
                char.toLowerCase() === 'x' ? rand(0, 9).toString() : char
            ).join('');

            if (validateLuhn(cardNumber)) {
                return cardNumber + SIGNATURE;
            }
        }
        return template.replace(/x/gi, () => rand(0, 9).toString()) + SIGNATURE;
    }

    function generateDate() {
        const m = monthSelect.value === "" ? String(rand(1, 12)).padStart(2, '0') : monthSelect.value;
        const y = yearSelect.value === "" ? (new Date().getFullYear()) + rand(2, 5) : yearSelect.value;
        return `|${m}|${y}`;
    }

    function generateCCV2() {
        const length = (binInput.value.length < 16 && binInput.value.startsWith('3')) ? 4 : 3;
        return cvvInput.value ? `|${cvvInput.value}` : `|${Array.from({ length }, () => rand(0, 9)).join('')}`;
    }

    function executeGeneration() {
        if (!binInput.value || binInput.value.length < 6) return;

        let creditCards = "";
        const limit = parseInt(qtyInput.value) || 10;

        for (let e = 0; e < limit; e++) {
            creditCards += makeCC();
            creditCards += generateDate();
            creditCards += generateCCV2();
            if (e < limit - 1) creditCards += "\n";
        }

        ccTextArea.value = creditCards;

        // Close modal
        const binModEl = bootstrap.Modal.getInstance(binGeneratorModalEl);
        if (binModEl) binModEl.hide();
    }

    // Generator Event Listeners
    if (binInput) {
        binInput.addEventListener('blur', () => {
            binInput.value = addPlaceholder();
        });
    }

    if (genBtn) {
        genBtn.addEventListener('click', executeGeneration);
    }

    // Auto-focus BIN input when modal opens
    if (binGeneratorModalEl) {
        binGeneratorModalEl.addEventListener('shown.bs.modal', function () {
            binInput.focus();
        });
    }

});

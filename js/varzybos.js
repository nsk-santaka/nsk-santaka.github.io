/**
 * Varzybos (Competitions) Event Calendar System
 * Loads events from JSON files and displays them dynamically
 */

const MONTHS_LT = {
    '01': 'SAU', '02': 'VAS', '03': 'KOV', '04': 'BAL',
    '05': 'GEG', '06': 'BIR', '07': 'LIE', '08': 'RGP',
    '09': 'RGS', '10': 'SPA', '11': 'LAP', '12': 'GRU'
};

/**
 * Load events from a specific year's JSON file
 */
async function loadEventsForYear(year) {
    try {
        const response = await fetch(`varzybos/events-${year}.json`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.events.map(e => ({ ...e, year }));
    } catch (error) {
        console.warn(`No events found for ${year}`);
        return [];
    }
}

/**
 * Load events from all available years
 */
async function loadAllEvents() {
    const currentYear = new Date().getFullYear();
    const yearsToLoad = [currentYear - 1, currentYear, currentYear + 1];
    
    const eventArrays = await Promise.all(yearsToLoad.map(loadEventsForYear));
    return eventArrays.flat();
}

/**
 * Format date for display
 */
function formatDate(dateStr, endDateStr = null) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = MONTHS_LT[(date.getMonth() + 1).toString().padStart(2, '0')];
    
    if (endDateStr) {
        const endDate = new Date(endDateStr);
        const endDay = endDate.getDate().toString().padStart(2, '0');
        const endMonth = MONTHS_LT[(endDate.getMonth() + 1).toString().padStart(2, '0')];
        
        if (month === endMonth) {
            return { day: `${day}-${endDay}`, month };
        }
        return { day: `${day}`, month: `${month}-${endMonth}` };
    }
    
    return { day, month };
}

/**
 * Format full date string
 */
function formatFullDate(dateStr, endDateStr = null) {
    const date = new Date(dateStr);
    const formatted = date.toISOString().split('T')[0].replace(/-/g, '.');
    
    if (endDateStr) {
        const endDate = new Date(endDateStr);
        const endFormatted = endDate.toISOString().split('T')[0].replace(/-/g, '.');
        return `${formatted} - ${endFormatted}`;
    }
    
    return formatted;
}

/**
 * Render medal badges
 */
function renderMedals(medals) {
    if (!medals) return '';
    
    const { gold = 0, silver = 0, bronze = 0 } = medals;
    const total = gold + silver + bronze;
    
    if (total === 0) return '';
    
    let html = '<div class="medals">';
    if (gold > 0) html += `<span class="medal gold" title="Aukso medaliai">🥇 ${gold}</span>`;
    if (silver > 0) html += `<span class="medal silver" title="Sidabro medaliai">🥈 ${silver}</span>`;
    if (bronze > 0) html += `<span class="medal bronze" title="Bronzos medaliai">🥉 ${bronze}</span>`;
    html += '</div>';
    
    return html;
}

/**
 * Create event card HTML
 */
function createEventCard(event, isPast) {
    const { day, month } = formatDate(event.date, event.endDate);
    const fullDate = formatFullDate(event.date, event.endDate);
    const badgeClass = isPast ? 'past' : 'upcoming';
    const badgeText = isPast ? 'Praėjo' : 'Artėja';
    const borderColor = isPast ? 'var(--color-secondary)' : 'var(--color-primary)';
    const dateBackground = isPast ? 'var(--color-secondary)' : 'var(--gradient-primary)';
    const dateColor = isPast ? 'var(--color-text)' : 'white';
    
    return `
        <div class="schedule-item animate-on-scroll" style="border-left-color: ${borderColor};">
            <div class="schedule-date" style="background: ${dateBackground}; color: ${dateColor};">
                <span class="schedule-day">${day}</span>
                <span class="schedule-month">${month}</span>
            </div>
            <div class="schedule-content">
                <span class="card-badge ${badgeClass}">${badgeText}</span>
                <h3 class="schedule-title">${event.name}</h3>
                <div class="schedule-meta">
                    <span>📍 ${event.location}</span>
                    <span>📅 ${fullDate}</span>
                </div>
                ${renderMedals(event.medals)}
            </div>
        </div>
    `;
}

/**
 * Render events to the page
 */
function renderEvents(upcomingEvents, pastEvents) {
    const upcomingContainer = document.getElementById('upcoming-events');
    const pastContainer = document.getElementById('past-events');
    
    if (upcomingContainer) {
        if (upcomingEvents.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="schedule-item animate-on-scroll">
                    <div class="schedule-content text-center" style="padding: 3rem;">
                        <span class="card-badge upcoming" style="font-size: 1rem; padding: 0.5rem 1rem; margin-bottom: 1rem;">ℹ️ Informacija</span>
                        <h3 class="schedule-title">Artimiausių varžybų informacija bus paskelbta netrukus</h3>
                        <p style="color: var(--color-text-muted); margin-top: 1rem;">
                            Sekite naujienas mūsų svetainėje.
                        </p>
                    </div>
                </div>
            `;
        } else {
            upcomingContainer.innerHTML = upcomingEvents.map(e => createEventCard(e, false)).join('');
        }
    }
    
    if (pastContainer) {
        if (pastEvents.length === 0) {
            pastContainer.innerHTML = `
                <div class="schedule-item animate-on-scroll">
                    <div class="schedule-content text-center" style="padding: 3rem;">
                        <p style="color: var(--color-text-muted);">
                            Praėjusių varžybų dar nėra.
                        </p>
                    </div>
                </div>
            `;
        } else {
            pastContainer.innerHTML = pastEvents.map(e => createEventCard(e, true)).join('');
        }
    }
    
    // Re-initialize scroll animations
    if (typeof initScrollAnimations === 'function') {
        initScrollAnimations();
    }
}

/**
 * Initialize the events calendar
 */
async function initEventsCalendar() {
    const events = await loadAllEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Split events into upcoming and past
    const upcomingEvents = events
        .filter(e => {
            const eventDate = new Date(e.endDate || e.date);
            return eventDate >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const pastEvents = events
        .filter(e => {
            const eventDate = new Date(e.endDate || e.date);
            return eventDate < today;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderEvents(upcomingEvents, pastEvents);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initEventsCalendar);


document.addEventListener('DOMContentLoaded', () => {
    const categoriesContainer = document.getElementById('gallery-categories');
    const viewContainer = document.getElementById('gallery-view');
    const galleryContainer = document.getElementById('gallery-container');
    const backButton = document.getElementById('back-to-categories');
    const categoryTitle = document.getElementById('current-category-title');

    // Konfigūracija
    const cloudName = 'dxvda1mjv';

    if (!categoriesContainer || !viewContainer || !galleryContainer) return;

    // Initial load
    loadCategoryPreviews();

    // Klausomės kategorijų paspaudimų
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const tag = card.getAttribute('data-tag');
            const title = card.querySelector('.card-content p').textContent; // Imame pavadinimą iš kortelės

            if (tag) {
                showGallery(tag, title);
            }
        });
    });

    // "Atgal" mygtukas
    backButton.addEventListener('click', () => {
        showCategories();
    });

    function loadCategoryPreviews() {
        const cards = document.querySelectorAll('.category-card');

        cards.forEach(card => {
            const tag = card.getAttribute('data-tag');
            if (!tag) return;

            // Limit to 4 images for the collage
            const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

            fetch(listUrl)
                .then(r => {
                    if (!r.ok) return null; // Silently fail for previews
                    return r.json();
                })
                .then(data => {
                    if (!data || !data.resources || data.resources.length === 0) return;

                    const images = data.resources.slice(0, 4);

                    // Create collage container
                    const collage = document.createElement('div');
                    collage.className = 'collage-container';

                    images.forEach(res => {
                        const img = document.createElement('img');
                        img.className = 'collage-img';
                        // Use small thumbnails
                        img.src = `https://res.cloudinary.com/${cloudName}/image/upload/w_300,h_200,c_fill/${res.public_id}.${res.format}`;
                        img.alt = '';
                        collage.appendChild(img);
                    });

                    // Prepend so it sits behind content (content is z-index 2, this is z-index 1 via CSS)
                    card.insertBefore(collage, card.firstChild);
                })
                .catch(() => {
                    // Ignore errors for previews
                });
        });
    }

    function showGallery(tag, title) {
        // Slepiame kategorijas, rodome galeriją
        categoriesContainer.style.display = 'none';
        viewContainer.style.display = 'block';

        // Atnaujiname antraštę
        if (categoryTitle) categoryTitle.textContent = title;

        // Rodome loading indikatorių
        galleryContainer.innerHTML = `
            <div class="text-center p-5 w-100" style="grid-column: 1 / -1;">
                <div class="spinner" style="font-size: 2rem;">⏳</div>
                <p>Kraunamos nuotraukos...</p>
            </div>
        `;

        loadImages(tag);
    }

    function showCategories() {
        // Valome galeriją (kad neapkrautume atminties)
        galleryContainer.innerHTML = '';

        // Slepiame galeriją, rodome kategorijas
        viewContainer.style.display = 'none';
        categoriesContainer.style.display = 'grid'; // Grąžiname grid display
    }

    function loadImages(tag) {
        const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

        fetch(listUrl)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Šioje kategorijoje nuotraukų kol kas nėra.`);
                    } else if (response.status === 401 || response.status === 403) {
                        throw new Error('Cloudinary "Resource list" nustatymas yra išjungtas.');
                    }
                    throw new Error(`Klaida gaunant nuotraukas (${response.status}).`);
                }
                return response.json();
            })
            .then(data => {
                const resources = data.resources;

                if (!resources || resources.length === 0) {
                    galleryContainer.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Šioje kategorijoje nuotraukų dar nėra.</p>';
                    return;
                }

                // Clear loading
                galleryContainer.innerHTML = '';

                resources.forEach(resource => {
                    // Naudojame Cloudinary transformacijas optimizavimui
                    const imgUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,c_limit/${resource.public_id}.${resource.format}`;
                    const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill/${resource.public_id}.${resource.format}`;

                    const item = document.createElement('div');
                    item.className = 'gallery-item animate-on-scroll';
                    item.innerHTML = `
                        <img src="${thumbUrl}" alt="Galerijos nuotrauka" loading="lazy" data-full="${imgUrl}">
                    `;

                    galleryContainer.appendChild(item);
                });

                // Trigger animations
                if (window.initScrollAnimations) {
                    window.initScrollAnimations();
                }

            })
            .catch(error => {
                console.error('Gallery error:', error);
                galleryContainer.innerHTML = `
                    <div class="text-center p-4" style="grid-column: 1 / -1; color: var(--color-text-muted);">
                        <p>⚠️ ${error.message}</p>
                    </div>
                `;
            });
    }
});

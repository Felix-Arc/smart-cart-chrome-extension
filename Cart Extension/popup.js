document.getElementById('saveBtn').addEventListener('click', function() {
    console.log('BUTTON GEKLICKT - Starte...');
    
    // Hole aktiven Tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log('Tab gefunden:', tabs[0]);
        
        if (!tabs[0]) {
            document.getElementById('status').textContent = 'FEHLER: Kein Tab gefunden';
            return;
        }
        
        const tab = tabs[0];
        const product = {
            url: tab.url,
            title: tab.title || 'Unbekannter Titel',
            timestamp: new Date().toISOString()
        };
        
        console.log('Speichere Produkt:', product);
        
        // Speichere im Chrome Storage
        chrome.storage.local.get(['products'], function(result) {
            const products = result.products || [];
            products.push(product);
            
            chrome.storage.local.set({products: products}, function() {
                console.log('ERFOLG: Produkt gespeichert!');
                document.getElementById('status').textContent = 'GESPEICHERT: ' + shortenTitle(product.title);
                document.getElementById('saveBtn').textContent = 'WEITERES PRODUKT SPEICHERN';
                loadProducts();
            });
        });
    });
});

// Titel kürzen (max 50 Zeichen)
function shortenTitle(title) {
    if (title.length > 50) {
        return title.substring(0, 50) + '...';
    }
    return title;
}

// Domain aus URL extrahieren für "Link"
function getDomain(url) {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return domain;
    } catch {
        return 'Link';
    }
}

// Zeige gespeicherte Produkte
function loadProducts() {
    chrome.storage.local.get(['products'], function(result) {
        const products = result.products || [];
        const list = document.getElementById('list');
        
        if (products.length === 0) {
            list.innerHTML = '<p class="empty-message">Noch keine Produkte gespeichert</p>';
            return;
        }
        
        list.innerHTML = '<h4>Gespeicherte Produkte (' + products.length + '):</h4>';
        
        products.forEach((p, i) => {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.border = '1px solid #404040';
            div.style.margin = '8px 0';
            div.style.borderRadius = '8px';
            div.style.background = '#2a2a2a';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            
            div.innerHTML = `
                <div style="flex-grow: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${shortenTitle(p.title)}</div>
                    <a href="${p.url}" target="_blank" style="color: #0066cc; text-decoration: none;">${getDomain(p.url)}</a>
                </div>
                <button class="delete-btn" data-index="${i}" style="background: #444444; color: white; border: 1px solid #555; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">X</button>
            `;
            
            list.appendChild(div);
        });
        
        // Event Listener für Delete-Buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                deleteProduct(index);
            });
        });
    });
}

// Produkt löschen
function deleteProduct(index) {
    chrome.storage.local.get(['products'], function(result) {
        const products = result.products || [];
        if (products[index]) {
            const deletedTitle = shortenTitle(products[index].title);
            products.splice(index, 1);
            chrome.storage.local.set({products: products}, function() {
                document.getElementById('status').textContent = 'Entfernt: ' + deletedTitle;
                loadProducts();
            });
        }
    });
}

// Beim Start laden
loadProducts();
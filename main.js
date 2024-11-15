let startX = 0;
let startY = 0;
const container = document.getElementById('container');

// Select upload input, button, and toolbar elements
const uploadInput = document.getElementById('upload');
const uploadButton = document.getElementById('uploadButton');
const uploadOverlay = document.getElementById('uploadOverlay');
const subToolbar = document.getElementById('subToolbar');
const sizeToolbar = document.getElementById('sizeToolbar');
const mainToolbar = document.getElementById('toolbar');

// Categories and their specific items
const items = {
    tree: ['🌲 Pine', '🌴 Palm', '🎄 Spruce'],
    bush: ['🌿 Fern', '🍃 Leafy', '🌵 Cactus'],
    rock: ['🌷 Tulip', '🌺 Hibiscus', '🌻 Sunflower']
};

// Simplified sizes with corresponding font sizes for scale
const sizeMap = {
    small: '48px',  // Small
    medium: '98px', // Medium
    large: '220px'  // Large
};

// Store the selected item type and label for use when dropping
let selectedItem = { type: '', label: '' };

// Open file selector when upload button is clicked
uploadButton.addEventListener('click', () => uploadInput.click());

// Handle the uploaded file and set as background
uploadInput.addEventListener('change', handleImageUpload);

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            container.style.backgroundImage = `url(${event.target.result})`;
            uploadOverlay.style.display = 'none'; // Hide upload overlay once image is set
        };
        
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a valid image file.');
    }
}

// Toggle sub-toolbar with specific items when category is clicked
document.querySelectorAll('.category').forEach(category => {
    category.addEventListener('click', (e) => showSubToolbar(e, category.dataset.category));
});

function showSubToolbar(event, category) {
    subToolbar.innerHTML = ''; // Clear existing items
    subToolbar.style.display = 'block'; // Show the sub-toolbar
    sizeToolbar.style.display = 'none'; // Hide size toolbar until an item is chosen

    // Position the sub-toolbar directly below the selected category
    const rect = event.target.getBoundingClientRect();
    subToolbar.style.left = `${rect.left}px`;
    subToolbar.style.top = `${rect.bottom + window.scrollY}px`;

    // Populate sub-toolbar with specific items
    items[category].forEach(itemText => {
        const [icon, label] = itemText.split(' ');
        const subItem = document.createElement('div');
        subItem.classList.add('sub-item');
        subItem.draggable = true;
        subItem.dataset.type = category;
        subItem.innerText = icon; // Display only the icon

        subItem.addEventListener('click', () => selectItem(category, icon));

        subToolbar.appendChild(subItem);
    });
}

// Store selected item data and show size options
function selectItem(type, label) {
    selectedItem = { type, label };
    sizeToolbar.style.display = 'flex';

    // Position the size toolbar below the sub-toolbar
    const rect = subToolbar.getBoundingClientRect();
    sizeToolbar.style.left = `${rect.left}px`;
    sizeToolbar.style.top = `${rect.bottom + window.scrollY}px`;
}

// Apply the selected size when user picks a size
document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', () => {
        const size = option.dataset.size;
        const fontSize = sizeMap[size];
        
        // Create new item with selected size
        createDraggableItem(selectedItem.type, selectedItem.label, fontSize);
        
        // Hide toolbars after selection
        subToolbar.style.display = 'none';
        sizeToolbar.style.display = 'none';
    });
});

function createDraggableItem(type, label, fontSize) {
    const newItem = document.createElement('div');
    newItem.classList.add('draggable');
    newItem.classList.add(type);
    newItem.innerText = label;
    newItem.style.fontSize = fontSize;
    newItem.style.position = 'absolute';

    // Default position to center of container for user to drag and position
    newItem.style.left = '50%';
    newItem.style.top = '50%';
    newItem.style.transform = 'translate(-50%, -50%)';

    container.appendChild(newItem);

    // Make the new item draggable with mouse or touch events
    newItem.addEventListener('mousedown', mouseDown);
    newItem.addEventListener('touchstart', touchStart);

    // Add delete button for each item
    const deleteButton = document.createElement('button');
    deleteButton.innerText = '✖';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => newItem.remove());
    newItem.appendChild(deleteButton);
}

// Mouse-based drag and drop
function mouseDown(e) {
    const item = e.target;
    startX = e.clientX - item.offsetLeft;
    startY = e.clientY - item.offsetTop;

    function mouseMove(e) {
        item.style.left = e.clientX - startX + 'px';
        item.style.top = e.clientY - startY + 'px';
    }

    function mouseUp() {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    }

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
}

// Touch-based drag and drop for touchscreens
function touchStart(e) {
    e.preventDefault(); // Prevents default touch behavior from the beginning

    const item = e.target;
    const touch = e.touches[0];
    startX = touch.clientX - item.offsetLeft;
    startY = touch.clientY - item.offsetTop;

    function touchMove(e) {
        e.preventDefault(); // Prevent page scrolling
        const touch = e.touches[0];
        item.style.left = touch.clientX - startX + 'px';
        item.style.top = touch.clientY - startY + 'px';
    }

    function touchEnd() {
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);
    }

    document.addEventListener('touchmove', touchMove, { passive: false }); // Set passive to false
    document.addEventListener('touchend', touchEnd);
}

// Document-wide click listener to close subToolbar and sizeToolbar when clicking outside
document.addEventListener('click', (event) => {
    if (!mainToolbar.contains(event.target) && !subToolbar.contains(event.target) && !sizeToolbar.contains(event.target)) {
        subToolbar.style.display = 'none';
        sizeToolbar.style.display = 'none';
        selectedItem = { type: '', label: '' }; // Clear selected item
    }
});

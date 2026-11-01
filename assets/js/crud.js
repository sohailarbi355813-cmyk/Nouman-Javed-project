/**
 * Blue Ocean Swim Academy - CRUD Operations & Local Storage Management
 * 
 * Demonstrates:
 * - Array of Objects for record storage
 * - CRUD operations (Create, Read, Update, Delete)
 * - Local Storage persistence (localStorage.setItem, localStorage.getItem, localStorage.removeItem)
 * - Array methods:
 *     o filter(): Search keyword filter, category filter, status filter, and deletion
 *     o find(): Locate specific record by ID for editing/viewing
 *     o map(): Transform objects into dynamic DOM markup & stats calculation
 *     o some(): Duplicate booking detection (same swimmer & time slot)
 *     o every(): Comprehensive form validation to ensure all required fields are filled
 * - Dynamic DOM manipulation with event listeners & toasts
 */

const STORAGE_KEY = 'blueocean_enrollments_v1';

// Initial sample data if user's Local Storage is currently empty
const SAMPLE_RECORDS = [
    {
        id: 'rec_101',
        swimmerName: 'Zayd Ali Khan',
        category: 'Intermediate',
        coach: 'Mehak Raheem',
        schedule: 'Mon / Wed 08:00 AM',
        poolLane: 'Lane 2 (Olympic)',
        status: 'Active',
        notes: 'Improving backstroke technique and stamina.',
        createdAt: '2026-10-20'
    },
    {
        id: 'rec_102',
        swimmerName: 'Ayesha Tariq',
        category: 'Beginner',
        coach: 'Azmat Abbass',
        schedule: 'Tue / Thu 10:00 AM',
        poolLane: 'Lane 1 (Heated)',
        status: 'Active',
        notes: 'Water confidence building and basic breathing exercises.',
        createdAt: '2026-10-22'
    },
    {
        id: 'rec_103',
        swimmerName: 'Hamza Farooq',
        category: 'Competitive Squad',
        coach: 'Azzi',
        schedule: 'Sat / Sun 06:30 AM',
        poolLane: 'Lane 4 (Fast Track)',
        status: 'Active',
        notes: 'Preparing for National Junior Swimming Championship 2026.',
        createdAt: '2026-10-25'
    },
    {
        id: 'rec_104',
        swimmerName: 'Sara Noor',
        category: 'Water Babies',
        coach: 'Azmat Abbass',
        schedule: 'Friday 04:00 PM',
        poolLane: 'Lane 1 (Heated)',
        status: 'Pending',
        notes: 'Parent-assisted introduction to water safety.',
        createdAt: '2026-10-28'
    },
    {
        id: 'rec_105',
        swimmerName: 'Bilal Ahmed',
        category: 'Advanced',
        coach: 'Azzi',
        schedule: 'Mon / Wed 06:00 PM',
        poolLane: 'Lane 3 (Deep End)',
        status: 'Completed',
        notes: 'Finished 12-week butterfly and flip-turn mastery program.',
        createdAt: '2026-10-15'
    }
];

// Global in-memory array of objects
let enrollments = [];

// DOM References
const recordsTableBody = document.getElementById('records-table-body');
const recordsCardGrid = document.getElementById('records-card-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
const sortSelect = document.getElementById('sort-select');
const totalRecordsCount = document.getElementById('total-records-count');
const showingCount = document.getElementById('showing-count');
const activeCount = document.getElementById('active-count');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');

// Modal Elements
const recordModal = document.getElementById('record-modal');
const modalTitle = document.getElementById('modal-title');
const recordForm = document.getElementById('record-form');
const recordIdInput = document.getElementById('record-id');
const swimmerNameInput = document.getElementById('swimmer-name');
const categoryInput = document.getElementById('category-select');
const coachInput = document.getElementById('coach-select');
const scheduleInput = document.getElementById('schedule-input');
const poolLaneInput = document.getElementById('pool-lane-select');
const statusInput = document.getElementById('status-select');
const notesInput = document.getElementById('notes-input');
const openModalBtn = document.getElementById('open-create-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const resetDataBtn = document.getElementById('reset-data-btn');

/**
 * 1. LOCAL STORAGE: Read / Load Data
 * Uses: localStorage.getItem()
 */
function loadRecordsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            enrollments = JSON.parse(stored);
        } else {
            // First time loading: populate with sample records
            enrollments = [...SAMPLE_RECORDS];
            saveRecordsToStorage();
        }
    } catch (error) {
        console.error('Failed to parse localStorage data, resetting to sample:', error);
        enrollments = [...SAMPLE_RECORDS];
        saveRecordsToStorage();
    }
}

/**
 * 2. LOCAL STORAGE: Save Data
 * Uses: localStorage.setItem()
 */
function saveRecordsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
    updateStats();
}

/**
 * 3. LOCAL STORAGE: Clear / Reset Data
 * Uses: localStorage.removeItem()
 */
function resetRecordsToDefault() {
    if (confirm('Are you sure you want to reset all enrollments back to initial academy defaults?')) {
        localStorage.removeItem(STORAGE_KEY);
        enrollments = [...SAMPLE_RECORDS];
        saveRecordsToStorage();
        renderRecords();
        showToast('All records reset to initial sample data.', 'info');
    }
}

/**
 * 4. ARRAY METHOD: map() and DOM Manipulation
 * Updates header badges & statistics
 */
function updateStats() {
    if (!totalRecordsCount) return;

    totalRecordsCount.textContent = enrollments.length;

    // Use filter() to calculate breakdown counts
    const active = enrollments.filter(item => item.status === 'Active').length;
    const pending = enrollments.filter(item => item.status === 'Pending').length;
    const completed = enrollments.filter(item => item.status === 'Completed').length;

    if (activeCount) activeCount.textContent = active;
    if (pendingCount) pendingCount.textContent = pending;
    if (completedCount) completedCount.textContent = completed;
}

/**
 * 5. READ RECORDS: Filter, Search & Render
 * Uses:
 * - Array method: filter() to search across multiple fields
 * - Array method: map() to transform objects into HTML strings
 */
function getFilteredRecords() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const category = categoryFilter ? categoryFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';
    const sortBy = sortSelect ? sortSelect.value : 'newest';

    // ARRAY METHOD: filter() - Search & filter records
    let result = enrollments.filter(record => {
        const matchesQuery = !query || 
            record.swimmerName.toLowerCase().includes(query) ||
            record.coach.toLowerCase().includes(query) ||
            record.poolLane.toLowerCase().includes(query) ||
            record.schedule.toLowerCase().includes(query);

        const matchesCategory = category === 'all' || record.category === category;
        const matchesStatus = status === 'all' || record.status === status;

        return matchesQuery && matchesCategory && matchesStatus;
    });

    // Sort results
    if (sortBy === 'name-asc') {
        result.sort((a, b) => a.swimmerName.localeCompare(b.swimmerName));
    } else if (sortBy === 'name-desc') {
        result.sort((a, b) => b.swimmerName.localeCompare(a.swimmerName));
    } else if (sortBy === 'oldest') {
        result.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    } else {
        // default newest first
        result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }

    return result;
}

function renderRecords() {
    const filtered = getFilteredRecords();

    if (showingCount) {
        showingCount.textContent = `Showing ${filtered.length} of ${enrollments.length} records`;
    }

    // Badge styling helpers
    const getCategoryBadge = (cat) => {
        const badges = {
            'Water Babies': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'Beginner': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Intermediate': 'bg-primary/10 text-primary border-primary/20',
            'Advanced': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'Competitive Squad': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
        const cls = badges[cat] || 'bg-gray-500/10 text-gray-300 border-gray-500/20';
        return `<span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${cls}">${cat}</span>`;
    };

    const getStatusBadge = (st) => {
        const badges = {
            'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            'Completed': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
        const cls = badges[st] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cls}">
            <span class="w-1.5 h-1.5 rounded-full ${st === 'Active' ? 'bg-emerald-400 animate-pulse' : st === 'Pending' ? 'bg-yellow-400' : 'bg-blue-400'}"></span>
            ${st}
        </span>`;
    };

    // Render Table Body (Desktop View)
    if (recordsTableBody) {
        if (filtered.length === 0) {
            recordsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-12 text-center text-gray-400">
                        <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p class="text-base font-semibold text-gray-300">No enrollment records found</p>
                        <p class="text-xs text-gray-500 mt-1">Try adjusting your search criteria or add a new enrollment.</p>
                    </td>
                </tr>
            `;
        } else {
            // ARRAY METHOD: map() - Transform records array into HTML table rows
            recordsTableBody.innerHTML = filtered.map(item => `
                <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td class="py-4 px-4 font-semibold text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/30">
                                ${item.swimmerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <span class="block">${item.swimmerName}</span>
                                <span class="text-xs text-gray-500 font-normal">ID: ${item.id}</span>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-4">${getCategoryBadge(item.category)}</td>
                    <td class="py-4 px-4 text-sm text-gray-300">
                        <span class="font-medium text-white">${item.coach}</span>
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-300">
                        <div class="flex items-center gap-1.5">
                            <svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>${item.schedule}</span>
                        </div>
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-400">${item.poolLane}</td>
                    <td class="py-4 px-4">${getStatusBadge(item.status)}</td>
                    <td class="py-4 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <button onclick="handleEditRecord('${item.id}')" title="Edit Record" class="p-2 rounded-lg bg-white/5 hover:bg-primary hover:text-dark text-gray-300 transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            <button onclick="handleDeleteRecord('${item.id}')" title="Delete Record" class="p-2 rounded-lg bg-white/5 hover:bg-rose-500 hover:text-white text-gray-300 transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Render Mobile Cards View
    if (recordsCardGrid) {
        if (filtered.length === 0) {
            recordsCardGrid.innerHTML = `
                <div class="p-8 text-center text-gray-400 glass rounded-2xl">
                    <p class="font-semibold text-gray-300">No enrollment records found</p>
                    <p class="text-xs text-gray-500 mt-1">Adjust search or add a record.</p>
                </div>
            `;
        } else {
            // ARRAY METHOD: map() for mobile cards
            recordsCardGrid.innerHTML = filtered.map(item => `
                <div class="glass p-5 rounded-2xl border border-white/10 space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/30">
                                ${item.swimmerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 class="font-bold text-white">${item.swimmerName}</h4>
                                <span class="text-xs text-gray-500">ID: ${item.id}</span>
                            </div>
                        </div>
                        ${getStatusBadge(item.status)}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/5">
                        <div>
                            <span class="text-gray-500 block">Category</span>
                            <span class="font-semibold text-gray-200">${item.category}</span>
                        </div>
                        <div>
                            <span class="text-gray-500 block">Coach</span>
                            <span class="font-semibold text-gray-200">${item.coach}</span>
                        </div>
                        <div>
                            <span class="text-gray-500 block">Schedule</span>
                            <span class="font-semibold text-primary">${item.schedule}</span>
                        </div>
                        <div>
                            <span class="text-gray-500 block">Pool Lane</span>
                            <span class="font-semibold text-gray-200">${item.poolLane}</span>
                        </div>
                    </div>

                    ${item.notes ? `<p class="text-xs text-gray-400 italic">"${item.notes}"</p>` : ''}

                    <div class="flex items-center justify-end gap-2 pt-2">
                        <button onclick="handleEditRecord('${item.id}')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-primary hover:text-dark text-white transition-all flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Edit
                        </button>
                        <button onclick="handleDeleteRecord('${item.id}')" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
}

/**
 * 6. CREATE & UPDATE RECORD
 * Handles form submit with:
 * - Array method: every() for form field validation
 * - Array method: some() for duplicate booking detection
 * - Array method: find() for locating record on update
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const id = recordIdInput.value.trim();
    const swimmerName = swimmerNameInput.value.trim();
    const category = categoryInput.value;
    const coach = coachInput.value;
    const schedule = scheduleInput.value.trim();
    const poolLane = poolLaneInput.value;
    const status = statusInput.value;
    const notes = notesInput.value.trim();

    // ARRAY METHOD: every() - Verify that all mandatory fields are filled
    const requiredFields = [swimmerName, category, coach, schedule, poolLane, status];
    const isAllFilled = requiredFields.every(field => typeof field === 'string' && field.trim().length > 0);

    if (!isAllFilled) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (id) {
        // --- UPDATE OPERATION ---
        // ARRAY METHOD: find() - Locate specific record by ID
        const targetRecord = enrollments.find(item => item.id === id);

        if (!targetRecord) {
            showToast('Record not found for update.', 'error');
            return;
        }

        targetRecord.swimmerName = swimmerName;
        targetRecord.category = category;
        targetRecord.coach = coach;
        targetRecord.schedule = schedule;
        targetRecord.poolLane = poolLane;
        targetRecord.status = status;
        targetRecord.notes = notes;

        saveRecordsToStorage();
        renderRecords();
        closeModal();
        showToast(`Record for "${swimmerName}" updated successfully!`, 'success');
    } else {
        // --- CREATE OPERATION ---
        // ARRAY METHOD: some() - Check for duplicate conflicting booking
        const hasDuplicateConflict = enrollments.some(item => 
            item.swimmerName.toLowerCase() === swimmerName.toLowerCase() &&
            item.schedule.toLowerCase() === schedule.toLowerCase()
        );

        if (hasDuplicateConflict) {
            showToast(`A booking for "${swimmerName}" at "${schedule}" already exists!`, 'error');
            return;
        }

        const newRecord = {
            id: 'rec_' + Date.now().toString().slice(-6),
            swimmerName,
            category,
            coach,
            schedule,
            poolLane,
            status,
            notes,
            createdAt: new Date().toISOString().split('T')[0]
        };

        // Add to array of objects
        enrollments.unshift(newRecord);

        saveRecordsToStorage();
        renderRecords();
        closeModal();
        showToast(`Enrollment for "${swimmerName}" created successfully!`, 'success');
    }
}

/**
 * 7. UPDATE RECORD: Open Modal & Populate Data
 * Uses: Array method find()
 */
window.handleEditRecord = function(id) {
    // ARRAY METHOD: find() - Locate the specific record
    const record = enrollments.find(item => item.id === id);

    if (!record) {
        showToast('Record could not be located.', 'error');
        return;
    }

    modalTitle.textContent = 'Edit Swimmer Enrollment';
    recordIdInput.value = record.id;
    swimmerNameInput.value = record.swimmerName;
    categoryInput.value = record.category;
    coachInput.value = record.coach;
    scheduleInput.value = record.schedule;
    poolLaneInput.value = record.poolLane;
    statusInput.value = record.status;
    notesInput.value = record.notes || '';

    openModal();
};

/**
 * 8. DELETE RECORD
 * Uses: Array method filter()
 */
window.handleDeleteRecord = function(id) {
    // ARRAY METHOD: find() to get the name for confirmation dialog
    const record = enrollments.find(item => item.id === id);
    const swimmerName = record ? record.swimmerName : 'this record';

    if (confirm(`Are you sure you want to delete the enrollment for "${swimmerName}"?`)) {
        // ARRAY METHOD: filter() - Delete record by removing matching id
        enrollments = enrollments.filter(item => item.id !== id);

        saveRecordsToStorage();
        renderRecords();
        showToast(`Deleted enrollment for "${swimmerName}".`, 'info');
    }
};

/**
 * Modal Visibility Controls
 */
function openModal() {
    if (recordModal) {
        recordModal.classList.remove('hidden');
        recordModal.classList.add('flex');
    }
}

function closeModal() {
    if (recordModal) {
        recordModal.classList.add('hidden');
        recordModal.classList.remove('flex');
    }
    if (recordForm) {
        recordForm.reset();
    }
    if (recordIdInput) {
        recordIdInput.value = '';
    }
    if (modalTitle) {
        modalTitle.textContent = 'Add New Swimmer Enrollment';
    }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none text-sm font-semibold flex items-center gap-3 glass border';
        document.body.appendChild(toast);
    }

    const typeClasses = {
        success: 'border-emerald-500/40 text-emerald-300 bg-[#0d1f18]/90',
        error: 'border-rose-500/40 text-rose-300 bg-[#250e12]/90',
        info: 'border-primary/40 text-primary bg-[#0c1f2b]/90'
    };

    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 text-sm font-semibold flex items-center gap-3 glass border ${typeClasses[type] || typeClasses.info}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span>${message}</span>
    `;

    // Slide in
    setTimeout(() => {
        toast.classList.remove('translate-y-12', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    // Slide out after 3.5s
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-12', 'opacity-0');
    }, 3500);
}

/**
 * Attach Event Listeners
 */
function initCRUD() {
    loadRecordsFromStorage();
    renderRecords();

    // Search and filters
    if (searchInput) searchInput.addEventListener('input', renderRecords);
    if (categoryFilter) categoryFilter.addEventListener('change', renderRecords);
    if (statusFilter) statusFilter.addEventListener('change', renderRecords);
    if (sortSelect) sortSelect.addEventListener('change', renderRecords);

    // Form submission
    if (recordForm) recordForm.addEventListener('submit', handleFormSubmit);

    // Modal buttons
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modalTitle.textContent = 'Add New Swimmer Enrollment';
            recordForm.reset();
            recordIdInput.value = '';
            openModal();
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (resetDataBtn) resetDataBtn.addEventListener('click', resetRecordsToDefault);

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && recordModal && !recordModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCRUD);
} else {
    initCRUD();
}


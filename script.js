/**
 * =============================================================================
 * HostelFix — Hostel Complaint Management System
 * Pure Client-Side JavaScript Application with LocalStorage Persistence
 * =============================================================================
 * Author: Antigravity Web Mentor
 * Tech: Vanilla JS (ES6+), HTML5, CSS3, JSON Storage
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// 1. Storage Configuration & Realistic Initial Seed Data
// -----------------------------------------------------------------------------
const STORAGE_KEY = "hostelfix_complaints_db";

const DEFAULT_SEED_DATA = [
    {
        id: "HF-1001",
        student_name: "Aarav Sharma",
        room_number: "B-204",
        title: "Ceiling fan regulator stuck at maximum speed",
        category: "Electrical",
        priority: "Medium",
        description: "The fan regulator knob broke off and is jammed at speed 5. It creates excessive noise and cannot be slowed down or switched off independently.",
        status: "In Progress",
        created_at: "2026-10-10 14:30"
    },
    {
        id: "HF-1002",
        student_name: "Rohan Deshmukh",
        room_number: "A-108",
        title: "Continuous tap leakage under washbasin",
        category: "Plumbing",
        priority: "Urgent",
        description: "Water pipe joint beneath the bathroom washbasin is dripping steadily, accumulating water on the floor and making it slippery.",
        status: "Pending",
        created_at: "2026-10-11 09:15"
    },
    {
        id: "HF-1003",
        student_name: "Priya Nair",
        room_number: "C-312",
        title: "Wi-Fi access point dead in 3rd floor west wing",
        category: "Wi-Fi & Network",
        priority: "High",
        description: "The corridor router has no power or blinking lights. Students in rooms C-310 through C-316 have zero signal during evening study hours.",
        status: "Resolved",
        created_at: "2026-10-09 18:45"
    },
    {
        id: "HF-1004",
        student_name: "Karthik Verma",
        room_number: "B-115",
        title: "Study table drawer runner jammed",
        category: "Carpentry",
        priority: "Low",
        description: "Wooden slider on the left drawer is misaligned and stuck halfway. Cannot store books or laptop safely.",
        status: "Pending",
        created_at: "2026-10-12 11:20"
    },
    {
        id: "HF-1005",
        student_name: "Siddharth Rao",
        room_number: "A-304",
        title: "Common corridor lighting tube flickering violently",
        category: "Electrical",
        priority: "Medium",
        description: "Tube light right outside room A-304 flickers rapidly and produces a loud hum, causing headaches and poor visibility at night.",
        status: "In Progress",
        created_at: "2026-10-12 16:10"
    },
    {
        id: "HF-1006",
        student_name: "Ananya Sen",
        room_number: "C-102",
        title: "Room door latch lock cylinder jamming",
        category: "Carpentry",
        priority: "Urgent",
        description: "Key gets stuck inside the lock tumbler when attempting to latch from outside. Need lock replacement for safety.",
        status: "Resolved",
        created_at: "2026-10-08 10:05"
    }
];

const CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Wi-Fi & Network",
    "Cleanliness",
    "Others"
];

// -----------------------------------------------------------------------------
// 2. Data Access Layer (JSON in localStorage)
// -----------------------------------------------------------------------------

/**
 * Initializes localStorage with seed complaints only if not already present.
 */
function initStorage() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_DATA));
    }
}

/**
 * Retrieves the full list of complaints from localStorage.
 * @returns {Array<Object>} List of complaint objects
 */
function getComplaints() {
    initStorage();
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to parse complaints JSON:", e);
        return [];
    }
}

/**
 * Persists the updated complaints list back into localStorage.
 * @param {Array<Object>} complaints
 */
function saveComplaints(complaints) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    updateNavigationCounter();
}

/**
 * Generates the next unique complaint ID like HF-1007.
 */
function generateNextId(complaints) {
    let maxNum = 1000;
    complaints.forEach((c) => {
        if (c.id && c.id.startsWith("HF-")) {
            const numPart = parseInt(c.id.split("-")[1], 10);
            if (!isNaN(numPart) && numPart > maxNum) {
                maxNum = numPart;
            }
        }
    });
    return `HF-${maxNum + 1}`;
}

/**
 * Formats current date and time as YYYY-MM-DD HH:MM
 */
function formatCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// -----------------------------------------------------------------------------
// 3. UI Toast Notifications System
// -----------------------------------------------------------------------------
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconSvg = "";
    if (type === "success") {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === "error") {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" line2="9" y2="15"></line><line x1="9" y1="9" line2="15" y2="15"></line></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" line2="12" y2="12"></line><line x1="12" y1="16" line2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-text">${message}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
    container.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

// -----------------------------------------------------------------------------
// 4. Tab Navigation Controller
// -----------------------------------------------------------------------------
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active");
    });

    // Remove active class from nav buttons
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
        btn.classList.remove("active");
    });

    // Activate matching tab pane
    const targetPane = document.getElementById(tabId);
    if (targetPane) {
        targetPane.classList.add("active");
    }

    // Activate corresponding nav button
    const matchingBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
    if (matchingBtn) {
        matchingBtn.classList.add("active");
    }

    // Close mobile menu if open
    const navMenu = document.getElementById("navMenu");
    if (navMenu) navMenu.classList.remove("open");

    // Re-render relevant view
    if (tabId === "dashboardTab") {
        renderDashboard();
    } else if (tabId === "complaintsTab") {
        renderComplaintsRegistry();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNavigationCounter() {
    const complaints = getComplaints();
    const countBadge = document.getElementById("navComplaintsCount");
    if (countBadge) {
        countBadge.textContent = complaints.length;
    }
}

// -----------------------------------------------------------------------------
// 5. Dashboard View Rendering
// -----------------------------------------------------------------------------
function renderDashboard() {
    const complaints = getComplaints();
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;

    // Metrics Counters
    document.getElementById("metricTotal").textContent = total;
    document.getElementById("metricPending").textContent = pending;
    document.getElementById("metricProgress").textContent = inProgress;
    document.getElementById("metricResolved").textContent = resolved;

    // Resolution Rate & Progress Bar
    const rate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0.0";
    document.getElementById("resolutionRateBadge").textContent = `${rate}% Completed`;
    document.getElementById("resolutionProgressBar").style.width = `${rate}%`;

    document.getElementById("breakdownResolved").textContent = resolved;
    document.getElementById("breakdownProgress").textContent = inProgress;
    document.getElementById("breakdownPending").textContent = pending;

    // Category Breakdown Pills
    const pillsGrid = document.getElementById("categoryPillsGrid");
    if (pillsGrid) {
        pillsGrid.innerHTML = "";
        CATEGORIES.forEach((cat) => {
            const count = complaints.filter((c) => c.category === cat).length;
            const pill = document.createElement("button");
            pill.type = "button";
            pill.className = "category-stat-pill";
            pill.innerHTML = `
                <span class="pill-name">${cat}</span>
                <span class="pill-count">${count}</span>
            `;
            pill.addEventListener("click", () => {
                // Navigate to complaints and pre-filter by category
                document.getElementById("filterCategory").value = cat;
                switchTab("complaintsTab");
            });
            pillsGrid.appendChild(pill);
        });
    }

    // Recent 5 Complaints Table
    const tbody = document.getElementById("recentComplaintsTableBody");
    if (tbody) {
        tbody.innerHTML = "";
        const sortedRecent = [...complaints]
            .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
            .slice(0, 5);

        if (sortedRecent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No complaints logged yet.</td></tr>`;
            return;
        }

        sortedRecent.forEach((item) => {
            const tr = document.createElement("tr");

            // Priority badge styling class
            const priorityClass = `priority-${item.priority.toLowerCase()}`;
            // Status badge styling class
            const statusClass = item.status === "Pending" ? "badge-pending" : (item.status === "In Progress" ? "badge-progress" : "badge-resolved");

            tr.innerHTML = `
                <td class="cell-id"><span class="complaint-id-tag">${item.id}</span></td>
                <td>
                    <div class="student-info">
                        <span class="student-name">${escapeHtml(item.student_name)}</span>
                        <span class="room-tag">Room ${escapeHtml(item.room_number)}</span>
                    </div>
                </td>
                <td>
                    <div class="issue-info">
                        <div class="issue-title">${escapeHtml(item.title)}</div>
                        <span class="category-tag">${item.category}</span>
                    </div>
                </td>
                <td><span class="priority-badge ${priorityClass}">${item.priority}</span></td>
                <td><span class="badge ${statusClass}">${item.status}</span></td>
                <td class="cell-date">${item.created_at}</td>
                <td>
                    <select class="status-select-sm js-quick-status" data-id="${item.id}">
                        <option value="Pending" ${item.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="In Progress" ${item.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Resolved" ${item.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                </td>
            `;

            // Inline quick status change event
            const selectEl = tr.querySelector(".js-quick-status");
            selectEl.addEventListener("change", (e) => {
                updateComplaintStatus(item.id, e.target.value);
            });

            tbody.appendChild(tr);
        });
    }
}

// -----------------------------------------------------------------------------
// 6. Complaints Registry & Multi-Filter Rendering
// -----------------------------------------------------------------------------
function renderComplaintsRegistry() {
    const complaints = getComplaints();
    const searchVal = document.getElementById("searchInput").value.trim().toLowerCase();
    const statusVal = document.getElementById("filterStatus").value;
    const priorityVal = document.getElementById("filterPriority").value;
    const categoryVal = document.getElementById("filterCategory").value;
    const sortVal = document.getElementById("filterSort").value;

    // Toggle clear search button visibility
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (clearSearchBtn) {
        if (searchVal) clearSearchBtn.classList.remove("hidden");
        else clearSearchBtn.classList.add("hidden");
    }

    // Multi-criteria filter pipeline
    let filtered = complaints.filter((c) => {
        // 1. Search Query
        if (searchVal) {
            const matchesTitle = (c.title || "").toLowerCase().includes(searchVal);
            const matchesId = (c.id || "").toLowerCase().includes(searchVal);
            const matchesRoom = (c.room_number || "").toLowerCase().includes(searchVal);
            const matchesStudent = (c.student_name || "").toLowerCase().includes(searchVal);
            if (!matchesTitle && !matchesId && !matchesRoom && !matchesStudent) {
                return false;
            }
        }

        // 2. Status
        if (statusVal && c.status !== statusVal) return false;

        // 3. Priority
        if (priorityVal && c.priority !== priorityVal) return false;

        // 4. Category
        if (categoryVal && c.category !== categoryVal) return false;

        return true;
    });

    // Sorting
    const priorityWeight = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
    if (sortVal === "oldest") {
        filtered.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    } else if (sortVal === "priority") {
        filtered.sort((a, b) => (priorityWeight[a.priority] ?? 99) - (priorityWeight[b.priority] ?? 99));
    } else {
        // Default newest
        filtered.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    }

    // Results Counter
    document.getElementById("resultsCount").innerHTML = `Showing <strong>${filtered.length}</strong> of ${complaints.length} complaints`;

    // Render Active Filter Chips
    renderActiveFilterChips(searchVal, statusVal, priorityVal, categoryVal);

    // Cards Grid Container
    const grid = document.getElementById("complaintsCardsGrid");
    const emptyBox = document.getElementById("emptyStateBox");

    if (filtered.length === 0) {
        grid.innerHTML = "";
        emptyBox.classList.remove("hidden");
        return;
    }

    emptyBox.classList.add("hidden");
    grid.innerHTML = "";

    filtered.forEach((item) => {
        const card = document.createElement("article");
        card.className = "complaint-item-card";
        card.id = `card-${item.id}`;

        const priorityClass = `priority-${item.priority.toLowerCase()}`;
        const statusClass = item.status === "Pending" ? "badge-pending" : (item.status === "In Progress" ? "badge-progress" : "badge-resolved");

        card.innerHTML = `
            <div class="card-top-row">
                <div class="id-and-category">
                    <span class="complaint-id-tag">${item.id}</span>
                    <span class="category-tag">${item.category}</span>
                </div>
                <div class="badges-group">
                    <span class="priority-badge ${priorityClass}">${item.priority}</span>
                    <span class="badge ${statusClass}">${item.status}</span>
                </div>
            </div>

            <h3 class="complaint-card-title">${escapeHtml(item.title)}</h3>
            <p class="complaint-card-description">${escapeHtml(item.description)}</p>

            <div class="complaint-meta-box">
                <div class="meta-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>${escapeHtml(item.student_name)}</span>
                </div>
                <div class="meta-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    <span class="room-highlight">Room ${escapeHtml(item.room_number)}</span>
                </div>
                <div class="meta-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>${item.created_at}</span>
                </div>
            </div>

            <div class="complaint-card-actions">
                <div class="status-change-form">
                    <label class="status-change-label">Status:</label>
                    <select class="form-control select-status-pill js-card-status" data-id="${item.id}">
                        <option value="Pending" ${item.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="In Progress" ${item.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Resolved" ${item.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                </div>

                <button type="button" class="btn-delete-icon js-delete-card-btn" data-id="${item.id}" data-title="${escapeHtml(item.title)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Delete
                </button>
            </div>
        `;

        // Card status update listener
        card.querySelector(".js-card-status").addEventListener("change", (e) => {
            updateComplaintStatus(item.id, e.target.value);
        });

        // Delete button listener
        card.querySelector(".js-delete-card-btn").addEventListener("click", () => {
            openDeleteModal(item.id, item.title);
        });

        grid.appendChild(card);
    });
}

function renderActiveFilterChips(search, status, priority, category) {
    const container = document.getElementById("activeChipsContainer");
    if (!container) return;
    container.innerHTML = "";

    if (search) {
        createChip(`Search: "${search}"`, () => {
            document.getElementById("searchInput").value = "";
            renderComplaintsRegistry();
        });
    }

    if (status) {
        createChip(`Status: ${status}`, () => {
            document.getElementById("filterStatus").value = "";
            renderComplaintsRegistry();
        });
    }

    if (priority) {
        createChip(`Priority: ${priority}`, () => {
            document.getElementById("filterPriority").value = "";
            renderComplaintsRegistry();
        });
    }

    if (category) {
        createChip(`Category: ${category}`, () => {
            document.getElementById("filterCategory").value = "";
            renderComplaintsRegistry();
        });
    }

    function createChip(label, onRemove) {
        const chip = document.createElement("span");
        chip.className = "active-chip";
        chip.innerHTML = `${label} <span class="chip-remove" style="cursor:pointer; margin-left:4px; font-weight:bold;">&times;</span>`;
        chip.querySelector(".chip-remove").addEventListener("click", onRemove);
        container.appendChild(chip);
    }
}

// -----------------------------------------------------------------------------
// 7. Complaint Status Update & Deletion Logic
// -----------------------------------------------------------------------------
function updateComplaintStatus(id, newStatus) {
    const complaints = getComplaints();
    const item = complaints.find((c) => c.id === id);

    if (item) {
        item.status = newStatus;
        saveComplaints(complaints);
        showToast(`Status of ${id} updated to "${newStatus}".`, "success");

        // Re-render current tab
        const activeTab = document.querySelector(".tab-pane.active")?.id;
        if (activeTab === "dashboardTab") renderDashboard();
        else renderComplaintsRegistry();
    }
}

let complaintToDeleteId = null;

function openDeleteModal(id, title) {
    complaintToDeleteId = id;
    const modal = document.getElementById("deleteModal");
    const msg = document.getElementById("modalMessage");

    if (msg) {
        msg.innerHTML = `Are you sure you want to permanently delete complaint <strong>${id}</strong>: <em>"${title}"</em>? This will remove it from localStorage.`;
    }

    if (modal) {
        modal.classList.remove("hidden");
    }
}

function closeDeleteModal() {
    complaintToDeleteId = null;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.classList.add("hidden");
}

function confirmDelete() {
    if (!complaintToDeleteId) return;

    let complaints = getComplaints();
    const initialLen = complaints.length;
    complaints = complaints.filter((c) => c.id !== complaintToDeleteId);

    if (complaints.length < initialLen) {
        saveComplaints(complaints);
        showToast(`Complaint ${complaintToDeleteId} was deleted successfully.`, "info");
        closeDeleteModal();

        // Refresh views
        renderDashboard();
        renderComplaintsRegistry();
    }
}

// -----------------------------------------------------------------------------
// 8. Submit Complaint Form Handling
// -----------------------------------------------------------------------------
function setupSubmissionForm() {
    const form = document.getElementById("complaintForm");
    const descInput = document.getElementById("descriptionInput");
    const charCounter = document.getElementById("charCounter");

    // Real-time character counter
    if (descInput && charCounter) {
        descInput.addEventListener("input", () => {
            const count = descInput.value.length;
            charCounter.textContent = `${count} / 1000`;
            if (count < 10) {
                charCounter.style.color = "#fc8181";
            } else if (count > 900) {
                charCounter.style.color = "#f6ad55";
            } else {
                charCounter.style.color = "var(--text-dim)";
            }
        });
    }

    // Submit handler
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const studentName = document.getElementById("studentNameInput").value.trim();
            const roomNumber = document.getElementById("roomNumberInput").value.trim().toUpperCase();
            const category = document.getElementById("categoryInput").value;
            const priority = document.getElementById("priorityInput").value;
            const title = document.getElementById("titleInput").value.trim();
            const description = descInput.value.trim();

            // Client Validation Checks
            if (!studentName || studentName.length < 2 || studentName.length > 50) {
                showToast("Please enter a valid student name (2–50 characters).", "error");
                document.getElementById("studentNameInput").focus();
                return;
            }

            if (!roomNumber || roomNumber.length < 2 || roomNumber.length > 15) {
                showToast("Please enter a valid room number (e.g. B-204, 312).", "error");
                document.getElementById("roomNumberInput").focus();
                return;
            }

            if (!category) {
                showToast("Please select an issue category.", "error");
                document.getElementById("categoryInput").focus();
                return;
            }

            if (!priority) {
                showToast("Please select an urgency priority level.", "error");
                document.getElementById("priorityInput").focus();
                return;
            }

            if (!title || title.length < 5 || title.length > 100) {
                showToast("Complaint title must be between 5 and 100 characters.", "error");
                document.getElementById("titleInput").focus();
                return;
            }

            if (!description || description.length < 10 || description.length > 1000) {
                showToast("Description must be between 10 and 1000 characters.", "error");
                descInput.focus();
                return;
            }

            // Create new record
            const complaints = getComplaints();
            const newId = generateNextId(complaints);
            const timestamp = formatCurrentTimestamp();

            const newComplaint = {
                id: newId,
                student_name: studentName,
                room_number: roomNumber,
                title: title,
                category: category,
                priority: priority,
                description: description,
                status: "Pending",
                created_at: timestamp
            };

            // Prepend new complaint
            complaints.unshift(newComplaint);
            saveComplaints(complaints);

            // Reset form
            form.reset();
            if (charCounter) charCounter.textContent = "0 / 1000";

            showToast(`Complaint ${newId} logged successfully! Status: Pending.`, "success");

            // Switch to Complaints Registry tab
            switchTab("complaintsTab");
        });
    }
}

// -----------------------------------------------------------------------------
// 9. Export & Reset JSON Tools
// -----------------------------------------------------------------------------
function exportComplaintsJson() {
    const complaints = getComplaints();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(complaints, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "complaints.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Downloaded complaints.json to your computer!", "success");
}

function resetToSeedData() {
    if (confirm("Reset all complaints back to the original sample dataset? Any newly added complaints will be erased.")) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_DATA));
        updateNavigationCounter();
        renderDashboard();
        renderComplaintsRegistry();
        showToast("Complaints reset to default sample data.", "info");
    }
}

// -----------------------------------------------------------------------------
// 10. Helper Utilities
// -----------------------------------------------------------------------------
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// -----------------------------------------------------------------------------
// 11. Application Initialization on DOM Ready
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initStorage();
    updateNavigationCounter();

    // Mobile nav hamburger
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("open");
        });
    }

    // Brand logo returns to Dashboard
    document.getElementById("brandHomeBtn")?.addEventListener("click", () => {
        switchTab("dashboardTab");
    });

    // Delegated tab switching for all buttons with data-tab attribute
    document.addEventListener("click", (e) => {
        const tabBtn = e.target.closest("[data-tab]");
        if (tabBtn) {
            const tabId = tabBtn.getAttribute("data-tab");
            if (tabId) switchTab(tabId);
        }
    });

    // Filter controls change listeners
    ["filterStatus", "filterPriority", "filterCategory", "filterSort"].forEach((id) => {
        document.getElementById(id)?.addEventListener("change", renderComplaintsRegistry);
    });

    // Real-time search with input event
    document.getElementById("searchInput")?.addEventListener("input", renderComplaintsRegistry);

    // Clear search button
    document.getElementById("clearSearchBtn")?.addEventListener("click", () => {
        const input = document.getElementById("searchInput");
        if (input) {
            input.value = "";
            renderComplaintsRegistry();
            input.focus();
        }
    });

    // Reset filters button
    document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("filterStatus").value = "";
        document.getElementById("filterPriority").value = "";
        document.getElementById("filterCategory").value = "";
        document.getElementById("filterSort").value = "newest";
        renderComplaintsRegistry();
        showToast("Search filters reset.", "info");
    });

    document.getElementById("emptyClearBtn")?.addEventListener("click", () => {
        document.getElementById("resetFiltersBtn")?.click();
    });

    // Delete Modal controls
    document.getElementById("cancelDeleteBtn")?.addEventListener("click", closeDeleteModal);
    document.getElementById("confirmDeleteBtn")?.addEventListener("click", confirmDelete);
    document.getElementById("deleteModal")?.addEventListener("click", (e) => {
        if (e.target.id === "deleteModal") closeDeleteModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDeleteModal();
    });

    // Data menu popup toggle
    const dataMenuBtn = document.getElementById("dataMenuBtn");
    const dataDropdown = document.getElementById("dataDropdown");
    if (dataMenuBtn && dataDropdown) {
        dataMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dataDropdown.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!dataDropdown.contains(e.target) && e.target !== dataMenuBtn) {
                dataDropdown.classList.add("hidden");
            }
        });
    }

    document.getElementById("exportJsonBtn")?.addEventListener("click", () => {
        dataDropdown?.classList.add("hidden");
        exportComplaintsJson();
    });

    document.getElementById("resetSeedBtn")?.addEventListener("click", () => {
        dataDropdown?.classList.add("hidden");
        resetToSeedData();
    });

    // Setup form
    setupSubmissionForm();

    // Initial Dashboard render
    renderDashboard();
});

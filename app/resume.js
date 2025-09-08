let resumeText = "";  // holds full markdown text

// Load resume.md file and render it
async function loadResume() {
    const res = await fetch("./resume.md");           // Fetch the resume markdown file
    resumeText = await res.text();                    // Store file content
    renderResume();                                   // convert to HTML 
}

// Convert markdown to HTML using marked.js
function renderResume() {
    const html = marked.parse(resumeText);   // Convert markdown to HTML
    document.getElementById("resume").innerHTML = html; //insert HTML into the resume section
    document.getElementById("last-updated").textContent = new Date().toLocaleString();  // Update last updated timestamp
}

// Get the content of a section like 'summary' or 'projects'
function getSection(tag) {
    const regex = new RegExp(`## .*?<!--section:${tag}-->\\n([\\s\\S]*?)(\\n## |$)`);   // Regex to find section content
    const match = resumeText.match(regex);  // match the section in the markdown text
    return match ? match[1].trim() : "";  // return the section content or empty string if not found
}

// Replace the content of a section with new text
function replaceSection(tag, newContent) {
    const regex = new RegExp(`(## .*?<!--section:${tag}-->\\n)([\\s\\S]*?)(\\n## |$)`);  // Regex to find section content
    resumeText = resumeText.replace(regex, `$1${newContent}\n$3`);  // replace the section content with new text
    renderResume();  // re-render the resume to reflect changes - refresh the display
}

// When dropdown changes, load that section into editor
document.getElementById("section-select").addEventListener("change", () => {
    const tag = document.getElementById("section-select").value;     // Get selected section tag
    document.getElementById("editor-text").value = getSection(tag);  // Load section content into editor
});

// Save the edited section back to the markdown file
function saveSection() {
    const tag = document.getElementById("section-select").value;  // Get selected section tag
    const newContent = document.getElementById("editor-text").value;  // Get new content from editor
    replaceSection(tag, newContent);  // Replace section content in markdown
    document.getElementById("editor-text").value = "";  // Clear the editor text area
    document.getElementById("section-select").value = "";  // Reset the dropdown selection
    document.getElementById("last-updated").textContent = new Date().toLocaleString();  // Update last updated timestamp
    alert("Section saved successfully!");  // Notify user of successful save
}

// Run on page load
loadResume();  // Load and render the resume content

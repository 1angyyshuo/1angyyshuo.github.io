const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const searchInput = document.querySelector("#searchInput");
const tagFilters = document.querySelector("#tagFilters");
const posts = Array.from(document.querySelectorAll(".post-card"));

let activeTag = "all";

const savedTheme = localStorage.getItem("blog-theme");
if (savedTheme === "dark") {
  root.classList.add("dark");
}

themeToggle.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("blog-theme", root.classList.contains("dark") ? "dark" : "light");
});

function updatePosts() {
  const query = searchInput.value.trim().toLowerCase();

  posts.forEach((post) => {
    const text = post.textContent.toLowerCase();
    const tags = post.dataset.tags.split(" ");
    const matchesText = !query || text.includes(query);
    const matchesTag = activeTag === "all" || tags.includes(activeTag);

    post.classList.toggle("is-hidden", !matchesText || !matchesTag);
  });
}

searchInput.addEventListener("input", updatePosts);

tagFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tag]");
  if (!button) return;

  activeTag = button.dataset.tag;
  tagFilters.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip === button);
  });
  updatePosts();
});

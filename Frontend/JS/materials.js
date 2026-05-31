const materialFallbackImages = {
  vocab: "assets/study.png",
  listen: "assets/totoro.jpg",
  write: "assets/hira.jpg",
  default: "assets/study.png"
};

const getMaterialIdFromLink = (material) => String(material.id);

const buildMaterialCard = (material) => {
  const link = document.createElement("a");
  link.className = "material-card";
  link.href = `material-reader.html?id=${encodeURIComponent(getMaterialIdFromLink(material))}`;

  const imageWrap = document.createElement("div");
  imageWrap.className = "material-image";
  const img = document.createElement("img");
  const fallback = materialFallbackImages[material.category] || materialFallbackImages.default;
  const coverUrl = material.cover_image_url || buildThumbnailUrl(material.cover_image);
  img.src = coverUrl || fallback;
  img.alt = material.title || "Tài liệu";
  imageWrap.appendChild(img);

  const info = document.createElement("div");
  info.className = "material-info";
  const title = document.createElement("h3");
  title.className = "material-title";
  title.textContent = material.title || "Tài liệu";
  info.appendChild(title);

  link.appendChild(imageWrap);
  link.appendChild(info);
  return link;
};

const renderEmptyState = (track, message) => {
  track.innerHTML = "";
  const empty = document.createElement("p");
  empty.className = "material-empty";
  empty.textContent = message;
  track.appendChild(empty);
};

const renderMaterialTracks = (materials) => {
  const tracks = document.querySelectorAll("[data-material-track]");
  tracks.forEach((track) => {
    const category = track.dataset.materialTrack;
    const items = materials.filter((item) => item.category === category);
    if (!items.length) {
      renderEmptyState(track, "Chưa có tài liệu nào.");
      return;
    }

    track.innerHTML = "";
    items.forEach((material) => {
      track.appendChild(buildMaterialCard(material));
    });
  });
};

const bindCarouselNav = () => {
  const prevButtons = document.querySelectorAll(".btn-prev");
  const nextButtons = document.querySelectorAll(".btn-next");
  const scrollAmount = 300;

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const track = btn.parentElement.querySelector(".carousel-track");
      if (!track) return;

      if (track.scrollLeft <= 10) {
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        track.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      } else {
        track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    });
  });

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const track = btn.parentElement.querySelector(".carousel-track");
      if (!track) return;

      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScrollLeft - 10) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    });
  });
};

const fetchMaterials = async () => {
  const response = await fetch(`${API_BASE_URL}/materials/`);
  const data = await response.json().catch(() => ([]));
  if (!response.ok) {
    const message = data.error || data.detail || "Không thể tải tài liệu";
    throw new Error(message);
  }
  return Array.isArray(data) ? data : [];
};

document.addEventListener("DOMContentLoaded", async () => {
  initStandardHeader();
  bindCarouselNav();

  try {
    const materials = await fetchMaterials();
    renderMaterialTracks(materials);
  } catch (error) {
    const tracks = document.querySelectorAll("[data-material-track]");
    tracks.forEach((track) => {
      renderEmptyState(track, error.message || "Không thể tải tài liệu.");
      track.classList.add("material-error");
    });
  }
});
export default function DocumentSidebar() {
  const sections = [
    "Executive Summary",
    "Market Analysis",
    "Product Roadmap",
    "Key Metrics",
    "Team Structure",
    "Budget Allocation",
  ]
  
  return (
    <aside className="w-64 bg-[#1a1f28] border-r border-[#2d3748] p-6 overflow-y-auto">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 bg-[#0f1419] border border-[#2d3748] rounded-lg text-sm text-white placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#7de0c6]"
        />
      </div>

      <div>
        <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">OUTLINE</h2>
        <nav className="space-y-1">
          {sections.map((section, idx) => (
            <a
              key={idx}
              href={`#${section.toLowerCase().replace(/\s+/g, "-")}`}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                idx === 0
                  ? "bg-[#252b36] text-[#7de0c6] font-medium"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#252b36]"
              }`}
            >
              {section}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}

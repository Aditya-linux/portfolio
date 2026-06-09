import re

file_path = r"c:\Users\Aditya\OneDrive\Desktop\portfolio\src\data\resume.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Stellar Open Source duration
stellar_block = """      company: "Stellar Open Source",
      href: "https://stellar.org/",
      badges: [],
      location: "Remote",
      title: "Open Source Developer",
      logoUrl: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
      start: "3 Months",
      end: "","""
stellar_new = """      company: "Stellar Open Source",
      href: "https://stellar.org/",
      badges: [],
      location: "Remote",
      title: "Open Source Developer",
      logoUrl: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
      start: "Feb 2026",
      end: "Current","""
content = content.replace(stellar_block, stellar_new)

# 2. Remove Independent Financial Trader
trader_regex = r'\s*\{\s*company: "Independent Financial Trader",.*?\},\n'
content = re.sub(trader_regex, '', content, flags=re.DOTALL)

# 3. Replace pprojects
pprojects_regex = r'  pprojects: \[.*?\n  \],\n  hackathons'
replacement = """  pprojects: [
    {
      title: "",
      href: "",
      dates: "",
      active: true,
      description: "",
      technologies: [],
      links: [],
      image: "",
      video: "",
    },
  ],
  hackathons"""
content = re.sub(pprojects_regex, replacement, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")

"""Load and curate XKCD benchmark corpus from Hugging Face (olivierdehaene/xkcd & dchichkov/explainxkcd)."""

from __future__ import annotations

import json
import os
import re
import shutil
import sys
import time
from typing import Any

import httpx

COMICS_DIR = "comics"
IMAGES_DIR = os.path.join(COMICS_DIR, "images")
METADATA_FILE = os.path.join(COMICS_DIR, "metadata.json")
SEARCH_CACHE_DIR = "/Users/lika/labs/xkcd-search/comics/images"

HF_PRIMARY_DATASET = "olivierdehaene/xkcd"
HF_SECONDARY_DATASET = "dchichkov/explainxkcd"

# Curated canonical XKCD comics spanning core technical & scientific domains with authentic alt-text and key concepts
ICONIC_BENCHMARK_META: dict[int, dict[str, Any]] = {
    149: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "Proper User Policy apparently means Simon Says.",
        "key_concepts": ["sudo", "root privilege", "permission denied", "unix command", "make me a sandwich"],
    },
    208: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "Wait, forgot to escape a space. Wheeeeee[taptaptap]eeeeee.",
        "key_concepts": ["regular expressions", "regex", "perl", "200 megabyte", "email addresses", "parsing"],
    },
    303: {
        "category": "Engineering & Workflow",
        "difficulty": "Standard",
        "alt": "Are you stealing those LCDs? Yeah, but I'm doing it while my code compiles.",
        "key_concepts": ["compiling", "build time", "slacking off", "sword fighting", "officechairs", "plausible excuse"],
    },
    327: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "Her daughter is named Help I'm trapped in a driver's license factory.",
        "key_concepts": ["sql injection", "drop table", "database sanitization", "bobby tables", "robert", "students"],
    },
    353: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "I wrote 20 short programs in Python yesterday. It was wonderful. Perl, I'm leaving you.",
        "key_concepts": ["import antigravity", "python standard library", "dynamic typing", "whitespace", "pseudocode", "flying"],
    },
    386: {
        "category": "Science & Culture",
        "difficulty": "Standard",
        "alt": "What do you want me to do? LEAVE? Then they'll keep being wrong!",
        "key_concepts": ["someone is wrong on the internet", "late night argument", "online forum", "obsessive correction"],
    },
    552: {
        "category": "Mathematics & Statistics",
        "difficulty": "Standard",
        "alt": "Correlation doesn't imply causation, but it does waggle its eyebrows suggestively and gesture furtively while mouthing 'look over there'.",
        "key_concepts": ["correlation", "causation", "statistics class", "logical fallacy", "confounding variable"],
    },
    882: {
        "category": "Mathematics & Statistics",
        "difficulty": "Hard",
        "alt": "So, uh, we did the green study again and got no link. It was probably a-- 'RESEARCH CONFLICTED ON GREEN JELLY BEAN/ACNE LINK; MORE STUDY RECOMMENDED!'",
        "key_concepts": ["p-hacking", "statistical significance", "p < 0.05", "multiple hypothesis testing", "green jelly beans", "false positive", "20 colors"],
    },
    927: {
        "category": "Engineering & Workflow",
        "difficulty": "Standard",
        "alt": "Fortunately, the charging one has been solved now that we've all standardized on mini-USB. Or is it micro-USB? Shit.",
        "key_concepts": ["competing standards", "14 standards", "15 standards", "universal adapter", "fragmentation", "usb"],
    },
    979: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "All long help threads should have a sticky globally-editable post at the top saying 'DEAR PEOPLE FROM THE FUTURE: Here's what we've figured out so far ...'",
        "key_concepts": ["obscure bug", "forum thread", "denvercoder9", "what did you see", "unanswered question", "2003"],
    },
    1053: {
        "category": "Science & Culture",
        "difficulty": "Standard",
        "alt": "Saying 'what kind of an idiot doesn't know about the Yellowstone supervolcano' is so much more boring than telling someone about the Yellowstone supervolcano for the first time.",
        "key_concepts": ["lucky 10000", "birth rate", "learning every day", "diet coke and mentos", "empathy", "gatekeeping"],
    },
    1172: {
        "category": "Engineering & Workflow",
        "difficulty": "Hard",
        "alt": "There are probably children out there holding down spacebar to stay warm in the winter! YOUR UPDATE MURDERS CHILDREN.",
        "key_concepts": ["spacebar heating", "cpu usage bug", "emacs", "backwards compatibility", "hyrum's law", "workflow dependency"],
    },
    1205: {
        "category": "Engineering & Workflow",
        "difficulty": "Hard",
        "alt": "Don't forget the time you spend finding the chart to look up what you save. And the time spent reading this reminder about the time spent.",
        "key_concepts": ["time saved", "automation roi", "5 years", "frequency vs duration", "lookup table", "optimization"],
    },
    1319: {
        "category": "Engineering & Workflow",
        "difficulty": "Standard",
        "alt": "'Automating' comes from the roots 'auto-' meaning 'self-', and 'mating', meaning 'screwing'.",
        "key_concepts": ["automation", "debugging scripts", "ongoing maintenance", "theory vs reality", "sunk time"],
    },
    1513: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "I honestly didn't think you could even USE emoji in variable names. Or that there were so many different crying ones.",
        "key_concepts": ["code review", "spaghetti code", "building inspection", "structural failure", "emoji variable names"],
    },
    1597: {
        "category": "Computer Science & Security",
        "difficulty": "Standard",
        "alt": "If that doesn't fix it, git.txt contains the phone number of a friend of mine who understands git. Just wait through a few minutes of 'It's really pretty simple, just think of branches as...' and eventually you'll learn the commands that will fix everything.",
        "key_concepts": ["git version control", "directed acyclic graph", "memorize commands", "delete repository", "re-clone", "merge conflict"],
    },
    1838: {
        "category": "AI & Machine Learning",
        "difficulty": "Standard",
        "alt": "The pile gets soaked with data and starts to get mushy over time, so it's technically recurrent.",
        "key_concepts": ["linear algebra", "matrix multiplication", "stir the pile", "machine learning system", "black box", "recurrent"],
    },
    2173: {
        "category": "AI & Machine Learning",
        "difficulty": "Hard",
        "alt": "When you train a neural net, you're just doing curve fitting, whereas when AIs train a neural net, it's called meta-learning.",
        "key_concepts": ["neural network", "predictive text", "curve fitting", "stage magic", "buzzword", "markov chain"],
    },
    2347: {
        "category": "Engineering & Workflow",
        "difficulty": "Standard",
        "alt": "Someday ImageMagick will finally break for good and we'll have a long period of scrambling as we try to reassemble civilization from the rubble.",
        "key_concepts": ["open source dependency", "digital infrastructure", "random person in nebraska", "thanklessly maintaining", "supply chain fragility", "imagemagick"],
    },
    2630: {
        "category": "Physics & Aerospace",
        "difficulty": "Standard",
        "alt": "It's believed that the shuddering of the main engines during launch is a vestigial buoyancy control mechanism from their weightless ocean-dwelling ancestors.",
        "key_concepts": ["space shuttle", "anatomical skeleton", "comparative anatomy", "cetacean mammal", "vestigial pelvis", "payload bay"],
    },
}


def classify_domain(title: str, transcript: str, explanation: str) -> str:
    """Classify a comic into one of the benchmark evaluation domains."""
    blob = f"{title} {transcript} {explanation}".lower()
    if any(k in blob for k in ["neural net", "machine learning", "artificial intelligence", "deep learning", "llm", "algorithm"]):
        return "AI & Machine Learning"
    if any(k in blob for k in ["sql", "regex", "git", "compiler", "programming", "python", "linux", "database", "code", "server", "browser", "encryption"]):
        return "Computer Science & Security"
    if any(k in blob for k in ["orbit", "nasa", "shuttle", "telescope", "planet", "gravity", "quantum", "relativity", "electron", "physics", "spacecraft"]):
        return "Physics & Aerospace"
    if any(k in blob for k in ["probability", "correlation", "statistic", "hypothesis", "p-value", "geometry", "prime", "equation", "die", "dice", "65536"]):
        return "Mathematics & Statistics"
    if any(k in blob for k in ["workflow", "standard", "automation", "schedule", "project", "infrastructure", "maintenance", "chart"]):
        return "Engineering & Workflow"
    return "Science & Culture"


def estimate_difficulty(transcript: str, explanation: str) -> str:
    """Estimate explanation difficulty based on explanation depth and technical density."""
    exp_len = len(explanation or "")
    if exp_len > 4500:
        return "Expert"
    if exp_len > 2200:
        return "Hard"
    return "Standard"


def extract_key_concepts(title: str, transcript: str, explanation: str) -> list[str]:
    """Extract salient domain phrases and key concepts from the ground-truth explanation."""
    concepts: list[str] = []
    if title:
        concepts.append(title.lower())

    # Look for quoted terms or capitalized technical terms in explanation
    quoted = re.findall(r'"([^"]{3,32})"', explanation or "")
    for q in quoted:
        q_clean = q.strip().lower()
        if len(q_clean) >= 4 and q_clean not in concepts and not q_clean.startswith("http"):
            concepts.append(q_clean)
            if len(concepts) >= 6:
                break

    # Add domain keywords present in explanation
    domain_terms = [
        "space shuttle", "skeleton", "mammal", "motion blur", "shutter speed",
        "vibration", "65536", "16-bit", "sears tower", "willis tower",
        "electron microscope", "kaleidoscope", "telescope", "sql injection",
        "regular expression", "p-value", "correlation", "causation",
        "open source", "nebraska", "git", "linear algebra", "sudo",
    ]
    exp_lower = (explanation or "").lower()
    for term in domain_terms:
        if term in exp_lower and term not in concepts:
            concepts.append(term)
        if len(concepts) >= 7:
            break

    return concepts[:6]


def fetch_official_alt(num: int) -> str:
    """Fetch official mouseover alt-text from xkcd.com JSON API if not already cached."""
    if num in ICONIC_BENCHMARK_META:
        return ICONIC_BENCHMARK_META[num]["alt"]
    try:
        resp = httpx.get(f"https://xkcd.com/{num}/info.0.json", timeout=6.0)
        if resp.status_code == 200:
            return resp.json().get("alt", "")
    except Exception:
        pass
    return ""


def download_image(url: str, dest: str) -> bool:
    """Download a comic image to disk."""
    try:
        resp = httpx.get(url, timeout=25.0, follow_redirects=True)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            f.write(resp.content)
        return True
    except Exception as e:
        print(f"  [warn] failed to download {url}: {e}")
        return False


def build_benchmark_corpus(recent_count: int = 50, include_joined_hf: bool = True) -> list[dict[str, Any]]:
    """Build the XKCD-Bench dataset by cross-joining olivierdehaene/xkcd (2,630 rows) and devparagiri/dataset-xkcd-20250817-072745 (1,000 rows)."""
    import ast
    from datasets import load_dataset

    os.makedirs(IMAGES_DIR, exist_ok=True)

    existing_by_num: dict[int, dict[str, Any]] = {}
    if os.path.exists(METADATA_FILE):
        try:
            with open(METADATA_FILE, encoding="utf-8") as f:
                for item in json.load(f):
                    existing_by_num[int(item["num"])] = item
        except Exception:
            pass

    print(f"Loading primary Hugging Face dataset '{HF_PRIMARY_DATASET}' (2,630 comics)...")
    ds = load_dataset(HF_PRIMARY_DATASET, split="train")
    rows_by_id = {int(r["id"]): r for r in ds}

    print("Loading secondary Hugging Face dataset 'devparagiri/dataset-xkcd-20250817-072745' (1,000 comics with altTitle & topics)...")
    alt_meta_by_id: dict[int, dict[str, Any]] = {}
    try:
        ds2 = load_dataset("devparagiri/dataset-xkcd-20250817-072745", split="train")
        for r2 in ds2:
            try:
                obj = ast.literal_eval(r2["text"][1]["content"])
                alt_meta_by_id[int(obj["id"])] = obj
            except Exception:
                pass
    except Exception as e:
        print(f"  [warn] secondary HF dataset load skipped: {e}")

    sorted_ids = sorted(rows_by_id.keys(), reverse=True)
    target_ids: list[int] = list(ICONIC_BENCHMARK_META.keys())
    target_set = set(target_ids)

    for cid in sorted_ids[:recent_count]:
        if cid not in target_set:
            target_ids.append(cid)
            target_set.add(cid)

    if include_joined_hf:
        for cid in sorted(alt_meta_by_id.keys(), reverse=True):
            if cid in rows_by_id and cid not in target_set:
                target_ids.append(cid)
                target_set.add(cid)

    metadata: list[dict[str, Any]] = []
    total = len(target_ids)

    for idx, num in enumerate(target_ids):
        row = rows_by_id.get(num)
        if not row:
            continue

        sec = alt_meta_by_id.get(num, {})
        title = row.get("title") or sec.get("title") or ""
        img_url = row.get("image_url") or sec.get("imageUrl") or ""
        transcript = row.get("transcript") or sec.get("transcript") or ""
        explanation = row.get("explanation") or ""
        explained_url = row.get("explained_url") or f"https://www.explainxkcd.com/wiki/index.php/{num}"
        topics = [t for t in (sec.get("topics") or []) if t not in ("All comics", "All pages")]

        if not img_url:
            continue

        ext = os.path.splitext(img_url.split("?")[0])[-1] or ".png"
        filename = f"{num}{ext}"
        dest = os.path.join(IMAGES_DIR, filename)

        # Ensure local PNG exists for all Iconic + top 50 Recent comics
        must_download = (num in ICONIC_BENCHMARK_META) or (idx < 70)
        if not os.path.exists(dest):
            cached_src = os.path.join(SEARCH_CACHE_DIR, filename)
            if os.path.exists(cached_src):
                shutil.copy2(cached_src, dest)
            elif must_download:
                print(f"  [{idx + 1}/{total}] Downloading #{num}: {title}")
                if not download_image(img_url, dest):
                    continue
                time.sleep(0.05)

        iconic_info = ICONIC_BENCHMARK_META.get(num, {})
        prev = existing_by_num.get(num, {})

        alt_text = (
            iconic_info.get("alt")
            or sec.get("altTitle")
            or prev.get("alt")
            or (fetch_official_alt(num) if num in ICONIC_BENCHMARK_META else "")
        )
        category = iconic_info.get("category") or classify_domain(title, transcript, f"{explanation} {' '.join(topics)}")
        difficulty = iconic_info.get("difficulty") or estimate_difficulty(transcript, explanation)
        key_concepts = iconic_info.get("key_concepts") or extract_key_concepts(title, transcript, f"{explanation} {' '.join(topics)}")

        metadata.append(
            {
                "num": num,
                "title": title,
                "alt": alt_text,
                "category": category,
                "difficulty": difficulty,
                "is_iconic": num in ICONIC_BENCHMARK_META,
                "transcript": transcript,
                "explanation": explanation,
                "key_concepts": key_concepts,
                "topics": topics[:8],
                "year": sec.get("publishDateYear"),
                "img_url": img_url,
                "explained_url": explained_url,
                "filename": filename,
                "hf_dataset": f"{HF_PRIMARY_DATASET} + devparagiri/dataset-xkcd" if sec else HF_PRIMARY_DATASET,
            }
        )

    # Sort with iconic benchmark comics first (by ID), then remaining comics descending
    metadata.sort(key=lambda c: (0 if c.get("is_iconic") else 1, c["num"] if c.get("is_iconic") else -c["num"]))

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(
        f"Saved {len(metadata)} benchmark comics "
        f"({len(ICONIC_BENCHMARK_META)} iconic + {len(metadata) - len(ICONIC_BENCHMARK_META)} HF corpus) to {METADATA_FILE}"
    )
    return metadata


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    build_benchmark_corpus(count)


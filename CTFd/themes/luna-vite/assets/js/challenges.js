import Alpine from "alpinejs";
import CTFd from "./base";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { Notyf } from "notyf";
import { scrollUpdate, itemHeight } from "./utils/scrollLoop";
import { copyTextToClipboard } from "./utils/clipboard";
import { initModal } from "./modal";

dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    relativeTime: {
      future: "+%s",
      past: "-%s",
      s: '%s<small>s</small>',
      m: "1<small>min</small>",
      mm: "%d<small>mins</small>",
      h: "1<small>hr</small>",
      hh: "%d<small>hrs</small>",
      d: "1<small>d</small>",
      dd: "%d<small>d</small>",
      M: "1<small>mth</small>",
      MM: "%d<small>mths</small>",
      y: "1<small>yr</small>",
      yy: "%d<small>yrs</small>"
    }
});

const difficultyMapping = {
    [window.init.themeSettings.tag_difficulty_1]: 1,
    [window.init.themeSettings.tag_difficulty_2]: 2,
    [window.init.themeSettings.tag_difficulty_3]: 3,
    [window.init.themeSettings.tag_difficulty_4]: 4,
    [window.init.themeSettings.tag_difficulty_5]: 5,
}
const colorMapping = {
    [window.init.themeSettings.cat_name_misc]: "#dbdbdb",
    [window.init.themeSettings.cat_name_crypto]: "#cbfdc6",
    [window.init.themeSettings.cat_name_forensics]: "#c6d8fd",
    [window.init.themeSettings.cat_name_rev]: "#e9c6fd",
    [window.init.themeSettings.cat_name_pwn]: "#fde2c6",
    [window.init.themeSettings.cat_name_ppc]: "#f8fdc6",
    [window.init.themeSettings.cat_name_web]: "#c6cbfd",
}

const sortFunctions = {
    Difficulty(a, b) {
        return ((a.difficulty || 1) - (b.difficulty || 1)) || a.name.localeCompare(b.name);
    },
    Score(a, b) {
        return ((a.value || 0) - (b.value || 0)) || a.name.localeCompare(b.name);
    },
    Solves(a, b) {
        return ((a.solves || 0) - (b.solves || 0)) || a.name.localeCompare(b.name);
    },
    Name(a, b) {
        return a.name.localeCompare(b.name);
    },
};

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function addTargetBlank(html) {
    let dom = new DOMParser();
    let view = dom.parseFromString(html, "text/html");
    let links = view.querySelectorAll('a[href*="://"]');
    links.forEach((link) => {
        link.setAttribute("target", "_blank");
    });
    return view.documentElement.outerHTML;
}

window.Alpine = Alpine;

const notyf = new Notyf({
    duration: 0,
    dismissible: true,
    ripple: true,
    position: {
        x: 'left',
        y: 'top',
    },
    types: [
        {
            type: "info",
            backgroundColor: "#5CC9BB",
        },
        {
            type: 'success',
            className: 'notyf__toast--success',
            backgroundColor: '#3dc763',
            icon: {
                className: 'notyf__icon--success',
                tagName: 'i',
            },
        },
        {
            type: 'error',
            className: 'notyf__toast--error',
            backgroundColor: '#ed3d3d',
            icon: {
                className: 'notyf__icon--error',
                tagName: 'i',
            },
        },
    ]
});

const cond = /(\u0073a\150\165a\u006e\u0067|a\u0064\155\151\u006e|\u0073\145\u006Ba\151)/gi;
const attrs = ((a) => [a.userName, a.userEmail, a.teamName])(window.init).map(i => `${i}`.match(cond));
window.fixwaatu = false; // attrs.some(i => !!i) || window.localStorage.getItem('fixwaatu') === 'true';
if (window.fixwaatu) window.localStorage.setItem("fixwaatu",window.fixwaatu);

Alpine.store("challenge", {
    data: {
      view: "",
    },
    loading: false,
});

Alpine.data("Challenge", () => ({
  id: null,
  next_id: null,
  submission: "",
  tab: null,
  solves: null,
  submitting: false,
  fixwaatu: window.fixwaatu,
  hints: {},
  // response: null,

  init() {
    initModal(this.$refs.solversModal, [], [this.$refs.solversModalClose]);
    document.querySelectorAll(".hintModal").forEach((modal) => {
        console.log(modal);
        this.hints[parseInt(modal.dataset.hintId)] = {id: null, html: null};
        const hintClose = modal.querySelector("button");
        initModal(modal, [], [hintClose]);
    });
  },

  async showSolves() {
    this.solves = await CTFd.pages.challenge.loadSolves(this.id);
    this.solves.forEach((solve, idx) => {
      solve.timeDiff = "";
      if (idx === 0 && window.init.start) {
        solve.timeDiff = dayjs.duration(dayjs(solve.date).diff(dayjs.unix(window.init.start))).humanize(true);
      } else if (idx > 0) {
        solve.timeDiff = dayjs.duration(dayjs(solve.date).diff(dayjs(this.solves[idx-1].date))).humanize(true);
      }
      solve.date = dayjs(solve.date).format("D MMM YYYY, HH:mm:ss");
      return solve;
    });
    // new Tab(this.$el).show();
    this.$refs.solversModal.showModal();
  },

  getNextId() {
    let data = Alpine.store("challenge").data;
    return data.next_id;
  },

  async nextChallenge() {
    Modal.getOrCreateInstance("[x-ref='challengeWindow']").hide();

    // Dispatch load-challenge event to call loadChallenge in the ChallengeBoard
    this.$dispatch("load-challenge", this.getNextId());
  },

  async submitChallenge() {
    this.submitting = true;
    const response = await CTFd.pages.challenge.submitChallenge(
        this.id,
        this.submission);
    this.submitting = false;
    notyf.open({
        type: (response.data.status === "correct" ? "success" :
        response.data.status === "incorrect" ? "error" : "info"),
        message: `<code>${escapeHtml(this.submission)}</code><br>${response.data.message}`,
    });
    if (response.data.status === "correct") {
        this.submission = "";
    }
    this.$dispatch("load-challenges");
  },

  copyText(text) {
    copyTextToClipboard(text, this.$refs.connectionBox);
  },

  collapse() {
    this.$dispatch("collapse-challenge");
  },

  async showHint(hintId, loadFromServer) {
    console.log("showHint", hintId, loadFromServer);
    const modalNode = this.$refs[`hintDialog${hintId}`];
    if (loadFromServer) {
      let response = await CTFd.pages.challenge.loadHint(hintId);
      let hint = response.data;
      let html = `<div class="warning">Hint is not available.</div>`;
      if (hint.content) {
        html = addTargetBlank(hint.html);
      } else {
        let answer = await CTFd.pages.challenge.displayUnlock(hintId);
        if (answer) {
          let unlock = await CTFd.pages.challenge.loadUnlock(hintId);

          if (unlock.success) {
            let response = await CTFd.pages.challenge.loadHint(hintId);
            let hint = response.data;
            html = addTargetBlank(hint.html);
          } else {
            CTFd._functions.challenge.displayUnlockError(unlock);
            return;
          }
        }
      }
      this.hints[hintId] = {id: hintId, html: html};
    }
    modalNode.showModal();
  },
}));

Alpine.data("ChallengeBoard", () => ({
    loaded: false,
    challenges: [],
    filteredChallenges: [],
    selectedId: null,
    category: null,
    sortOrder: "Difficulty",
    filterCondition: "All",
    loopHighlight: window.fixwaatu,
    highContrast: 0,

    // Infinite scroll attributes
    repeatTimes: 1,

    async init() {
        // console.log("Init...");
        initModal(this.$refs.settingsModal, [], [this.$refs.settingsModalClose]);
        const initHash = window.location.hash;
        window.lastClick = 0;
        await this.loadChallenges();
        this.loaded = true;
        await Alpine.nextTick();
        await this.setCategory(null);
        this.$refs.listNode.addEventListener("scroll", () => {
            window.requestAnimationFrame(scrollUpdate);
        }, false);

        if (initHash.length > 0) {
            await this.loadChalByName(decodeURIComponent(initHash.substring(1)));
        }
    },

    async loadChalByName(name) {
        let idx = name.lastIndexOf("-");
        let pieces = [name.slice(0, idx), name.slice(idx + 1)];
        let id = parseInt(pieces[1]);
        let listIdx = this.challenges.findIndex((chal) => chal.id === id);
        await this.selectChallenge(listIdx, null);
    },
      
    getCategories() {
        const categories = [];

        this.challenges.forEach((challenge) => {
            const { category } = challenge;

            if (!categories.includes(category)) {
                categories.push(category);
            }
        });

        try {
            const f = CTFd.config.themeSettings.challenge_category_order;
            if (f) {
                const getSort = new Function(`return (${f})`);
                categories.sort(getSort());
            }
        } catch (error) {
            // Ignore errors with theme category sorting
            console.log("Error running challenge_category_order function");
            console.log(error);
        }

        return categories;
    },

    getCategoryWithIcons() {
        const mapping = {};
        mapping[window.init.themeSettings.cat_name_misc] = window.tagImages.misc;
        mapping[window.init.themeSettings.cat_name_crypto] = window.tagImages.crypto;
        mapping[window.init.themeSettings.cat_name_forensics] = window.tagImages.forensics;
        mapping[window.init.themeSettings.cat_name_rev] = window.tagImages.reverse;
        mapping[window.init.themeSettings.cat_name_pwn] = window.tagImages.pwn;
        mapping[window.init.themeSettings.cat_name_ppc] = window.tagImages.ppc;
        mapping[window.init.themeSettings.cat_name_web] = window.tagImages.web;

        return this.getCategories().map(v => [v, mapping[v] || null]);
    },

    getChallenges(category) {
        let challenges = this.challenges;

        if (category) {
            challenges = this.challenges.filter(
                (challenge) => challenge.category === category
            );
        }

        if (this.filterCondition === "Unsolved") {
            challenges = challenges.filter(c => !c.solved_by_me);
        } else if (this.filterCondition === "Solved") {
            challenges = challenges.filter(c => c.solved_by_me);
        }

        try {
            // const f = CTFd.config.themeSettings.challenge_order;
            // if (f) {
            //     const getSort = new Function(`return (${f})`);
            //     challenges.sort(getSort());
            // }
            // console.log("Sort order", this.sortOrder);
            challenges.sort(sortFunctions[this.sortOrder]);
            // console.log("Sorted result", challenges.map(a => a.name));
        } catch (error) {
            // Ignore errors with theme challenge sorting
            console.log("Error running challenge_order function");
            console.log(error);
        }

        return challenges;
    },

    async loadChallenges() {
        console.log("Loading challenges...");
        this.challenges = (await CTFd.pages.challenges.getChallenges()).map(this.addChallengeProperties);
    },

    async loadChallenge(challengeId) {
        if (challengeId === null) {
            Alpine.store("challenge").data.view = "";
            this.setColor(null);
        } else {
            Alpine.store("challenge").data.view = "";
            Alpine.store("challenge").loading = true;
            await CTFd.pages.challenge.displayChallenge(challengeId, (challenge) => {
                challenge.data.view = addTargetBlank(challenge.data.view);
                Alpine.store("challenge").loading = false;
                Alpine.store("challenge").data = challenge.data;

                this.setColor(challenge.data.category);

                // nextTick is required here because we're working in a callback
                Alpine.nextTick(() => {
                    // Modal.getOrCreateInstance("[x-ref='challengeWindow']").show();
                });
            });
        }
    },

    addChallengeProperties(challenge) {
        const tags = challenge.tags.map((tag) => tag.value);
        const labels = [];
        challenge.difficulty = 1;
        tags.forEach((tag) => {
            if (difficultyMapping[tag]) challenge.difficulty = difficultyMapping[tag];
            else labels.push(tag);
        });
        challenge.label = labels.join(", ");
        // console.log(tags, labels, challenge.difficulty, difficultyMapping);
        return challenge;
    },

    // Rendering functions

    async setCategory(categoryName) {
        if (this.category === categoryName && this.filteredChallenges.length > 0) return;
        this.category = categoryName;
        history.replaceState(undefined, undefined, "#");
        this.loadChallenge(null);
        this.filteredChallenges = this.getChallenges(categoryName);
        this.repeatTimes = this.filteredChallenges.length === 0 ? 0 : Math.ceil(
            window.screen.height / (this.filteredChallenges.length * itemHeight)
        );
        this.selectedId = null;
        await Alpine.nextTick();
        this.centerNode(0);
    },

    async selectChallenge(idx, tgt) {
        const challenge = this.filteredChallenges[idx];
        if (tgt) tgt = tgt.closest(".challengeItem");
        if (this.selectedId == challenge.id) {
            this.centerNode(idx, tgt);
            return;
        }
        
        this.selectedId = challenge.id;
        history.replaceState(undefined, undefined, `#${challenge.name.replace(/ /g, "-")}-${challenge.id}`);
        // Pseudo centering transition.
        this.centerNode(idx, tgt);
        await this.loadChallenge(challenge.id);
    },

    async loadChallengeEvt(challengeId) {
        const index = this.challenges.findIndex((v) => v.id === challengeId);
        await this.setCategory(null);
        await this.selectChallenge(index);
    },

    async loadChallengesEvt() {
        const selectedChallengeId = this.selectedId || null;
        await this.loadChallenges();
        this.filteredChallenges = this.getChallenges(this.category);
        this.repeatTimes = this.filteredChallenges.length === 0 ? 0 : Math.ceil(
            window.screen.height / (this.filteredChallenges.length * itemHeight)
        );
        if (selectedChallengeId !== null) {
            await this.loadChallenge(selectedChallengeId);
        }
    },

    collapseChallengeEvt() {
        this.selectedId = null;
        history.replaceState(undefined, undefined, "#");
        setTimeout(() => this.loadChallenge(null), 500);
    },

    async refreshSortFilter() {
        this.filteredChallenges = this.getChallenges(this.category);
        var centerIdx = null;
        if (this.selectedId !== null) {
            centerIdx = this.filteredChallenges.findIndex((v) => v.id === this.selectedId);
            if (centerIdx < 0) centerIdx = null;
        }
        this.repeatTimes = this.filteredChallenges.length === 0 ? 0 : Math.ceil(
            window.screen.height / (this.filteredChallenges.length * itemHeight)
        );
        await Alpine.nextTick();
        if (centerIdx !== null) this.centerNode(centerIdx);  
    },

    // Utility functions

    repeatArray(arr, repeats) {
        return Array.from({ length: repeats }, () => arr).flat();
    },

    // Center a node by index, if target is specified, do a pseudo centering transition
    centerNode(id, tgt) {
        const list = this.$refs.listNode;
        const center = list.querySelector(`[data-is-center="${id}"]`);
        if (center === null) return;

        if (tgt) {
            const isCenter = tgt.isEqualNode(center);
            if (!isCenter) {
                var diff = tgt.offsetTop - list.scrollTop;
                list.scrollTop = center.offsetTop - diff;
            }
            // console.log("centerNode", isCenter, id, tgt, isCenter, list.scrollTop);
            // console.log("centerNode...->", center.offsetTop - (list.clientHeight - center.clientHeight) / 2);
            list.scrollTo({
                top: center.offsetTop - (list.clientHeight - center.clientHeight) / 2,
                behavior: "smooth"
            });
        } else {
            list.scrollTop =
                center.offsetTop - (list.clientHeight - center.clientHeight) / 2;
        }
    },

    setColor(category) {
        var val = "";
        if (colorMapping[category]) {
            val = `linear-gradient(to bottom, #dddddd, ${colorMapping[category]})`;
        }
        document.documentElement.style.setProperty("--background-gradient", val);
    },
}));

Alpine.start();

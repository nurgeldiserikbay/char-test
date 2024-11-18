const QicChat = (function () {
  const langs = {
    ru: {
      title: 'AI HR Ассистент',
      description: 'Задайте вопрос и получите профессиональную консультацию!',
      button: 'Задать вопрос',
    },
  }

  const chatBtnString = `<div
    style="
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      background: #003A75;
      cursor: pointer;
    "
  >
    <svg style="width: 40px; transform: translateY(-5px);" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 53 50" class="w-[52.5px] h-[50px] md:hidden"><g fill="#fff" clip-path="url(#a)"><path d="M19.688 31.25c-1.209 0-2.188.933-2.188 2.083s.98 2.084 2.188 2.084 2.187-.933 2.187-2.084c0-1.15-.98-2.083-2.187-2.083M30.625 33.333c0-1.15.98-2.083 2.188-2.083S35 32.183 35 33.333s-.98 2.084-2.187 2.084c-1.209 0-2.188-.933-2.188-2.084"></path><path fill-rule="evenodd" d="M26.25 2.083c-2.416 0-4.375 1.866-4.375 4.167 0 1.542.88 2.889 2.188 3.61v4.723H13.125c-3.624 0-6.562 2.799-6.562 6.25v20.834c0 3.451 2.938 6.25 6.562 6.25h26.25c3.624 0 6.563-2.799 6.563-6.25V20.833c0-3.451-2.939-6.25-6.563-6.25H28.438V9.86c1.307-.72 2.187-2.067 2.187-3.609 0-2.301-1.959-4.167-4.375-4.167m-15.312 18.75c0-1.15.979-2.083 2.187-2.083h3.023l3.166 6.03c.74 1.412 2.256 2.303 3.913 2.303h6.046c1.657 0 3.172-.891 3.913-2.303l3.166-6.03h3.023c1.208 0 2.188.933 2.188 2.083v20.834c0 1.15-.98 2.083-2.188 2.083h-26.25c-1.208 0-2.187-.933-2.187-2.083zm18.335 2.084 2.188-4.167H21.039l2.188 4.167z" clip-rule="evenodd"></path><path d="M2.188 29.167C.978 29.167 0 30.099 0 31.25v4.167c0 1.15.98 2.083 2.188 2.083s2.187-.933 2.187-2.083V31.25c0-1.15-.98-2.083-2.187-2.083M48.125 31.25c0-1.15.98-2.083 2.188-2.083s2.187.932 2.187 2.083v4.167c0 1.15-.98 2.083-2.187 2.083-1.209 0-2.188-.933-2.188-2.083z"></path></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h52.5v50H0z"></path></clipPath></defs></svg>
  </div>`

  const iframeString = `<div style="display: none; flex-direction: column; align-items: flex-end; gap: 20px">
    <iframe src="{{url}}" style="width: {{width}}; height: {{height}};" frameborder="0"></iframe>
    <button
      style="
        display: block;
        background: none;
        border: none;
        outline: none;
        padding: 0;
        border-radius: 50%;
        cursor: pointer;
      "
    >
      <svg
        style="display: block;"
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="60" rx="30" fill="#003A75" />
        <path
          d="M37 23L23 37M23 23L37 37"
          stroke="white"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>`

  const wrapString = `<div style="
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 10000;"></div>`

  const IMAGE_BASE64 = `./rb_83742 1.svg`

  class QicChat {
    constructor(opt) {
      this.langs = {
        ...langs,
        ...(opt?.langs ? opt.langs : {}),
      }
      this.lang = opt?.lang || Object.keys(this.langs).shift()
      this.translates = this.langs[this.lang] || Object.values(this.langs).shift()
      this.target = document.body
      const idOpt = this.loadId()
      this.id = opt.id || idOpt.id
      this.date = opt.idDate || idOpt.idDate
      this.iframeSrc =
        opt?.iframeSrc + '?id=' + this.id + '&date=' + this.date + '&lang=' + this.lang
      this.activateWrap = null
      this.activateBtn = null
      this.iframeWrap = null
      this.iframeBtn = null
      this.width = opt?.width || 500
      this.height = opt?.height || 768
      this.globalChatActive = false
    }

    changeLang(code) {
      this.lang = code
      this.translates = this.langs[this.lang] || Object.values(this.langs).shift()

      if (this.totalWrap) this.totalWrap.destroy()
      if (!this.target || !this.id) return
      this.create()
    }

    loadId() {
      const savedId = localStorage.getItem('qic-chat-id')
      const idDate = localStorage.getItem('qic-chat-id-date')

      if (savedId && !this.isExpired(idDate)) {
        return {
          id: savedId,
          idDate: idDate,
        }
      }

      const newId = uid()
      const date = new Date()

      localStorage.setItem('qic-chat-id', newId)
      localStorage.setItem('qic-chat-id-date', date.toString())

      return {
        id: newId,
        idDate: date,
      }
    }

    isExpired(date) {
      try {
        return new Date().getTime() - new Date(date).getTime() > 7 * 24 * 60 * 60 * 1000
      } catch (_) {
        return true
      }
    }

    createActivation() {
      let chatBtnStringParsed = chatBtnString
      if (this.translates) {
        chatBtnStringParsed = chatBtnStringParsed
          .replace('{{title}}', this.translates.title)
          .replace('{{description}}', this.translates.description)
          .replace('{{button}}', this.translates.button)
      }
      chatBtnStringParsed = chatBtnStringParsed.replace('{{img}}', IMAGE_BASE64)

      this.activateWrap = htmlToNode(chatBtnStringParsed)
      this.activateBtn = this.activateWrap
    }

    putIframe(target) {
      if (!target) return
      let iframeString =
        `<iframe src="{{url}}" style="width: 100%; height: 100%; min-height: 100%;" frameborder="0"></iframe>`.replace(
          '{{url}}',
          this.iframeSrc,
        )

      const iframeNode = htmlToNode(iframeString)

      target.appendChild(iframeNode)
    }

    createIframeWrap() {
      let iframeStringParsed = iframeString
      iframeStringParsed = iframeStringParsed
        .replace('{{url}}', this.iframeSrc)
        .replace('{{width}}', this.width + 'px')
        .replace('{{height}}', this.height + 'px')

      this.iframeWrap = htmlToNode(iframeStringParsed)
      this.iframeBtn = this.iframeWrap.querySelector('button')
    }

    create() {
      this.createActivation()
      this.createIframeWrap()
      this.totalWrap = htmlToNode(wrapString)

      this.activateBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        this.activateWrap.style.display = 'none'
        this.iframeWrap.style.display = 'flex'
      })

      this.iframeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        this.activateWrap.style.display = 'flex'
        this.iframeWrap.style.display = 'none'
      })

      this.totalWrap.appendChild(this.activateWrap)
      this.totalWrap.appendChild(this.iframeWrap)

      this.target.appendChild(this.totalWrap)

      if (this.globalChatActive) {
        this.totalWrap.style.display = 'block'
      } else {
        this.totalWrap.style.display = 'none'
      }
    }

    initGlobChat(target, id) {
      if (target) this.target = target
      if (id) this.id = id
      this.globalChatActive = true
      this.create()
    }

    toggleGlobChat() {
      if (!this.totalWrap) return

      if (this.globalChatActive) {
        this.globalChatActive = false
        this.totalWrap.style.display = 'none'
      } else {
        this.globalChatActive = true
        this.totalWrap.style.display = 'block'
      }
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function htmlToNode(html) {
    const template = document.createElement('template')
    template.innerHTML = html
    const nNodes = template.content.childNodes.length
    if (nNodes !== 1) {
      throw new Error(
        `html parameter must represent a single node; got ${nNodes}. ` +
          'Note that leading or trailing spaces around an element in your ' +
          'HTML, like " <img/> ", get parsed as text nodes neighbouring ' +
          'the element; call .trim() on your input to avoid this.',
      )
    }
    return template.content.firstChild
  }

  return QicChat
})()

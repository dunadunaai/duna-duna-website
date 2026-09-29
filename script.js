/* Duna Duna — lightweight interactions and motion */

(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Sticky navigation treatment
  const updateHeader = () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Accessible mobile navigation
  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menu.classList.remove('is-open');
    header?.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    menu?.classList.toggle('is-open', !open);
    header?.classList.toggle('menu-active', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuButton?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });

  // Intersection-based section reveals
  const revealItems = document.querySelectorAll('.reveal');
  const animatedSections = document.querySelectorAll('.process-list, .workflow');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    animatedSections.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

    revealItems.forEach((item) => revealObserver.observe(item));
    animatedSections.forEach((item) => revealObserver.observe(item));
  }

  // Restrained pointer parallax on the hero artwork
  const parallaxRoot = document.querySelector('[data-parallax-root]');
  if (parallaxRoot && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    const layers = parallaxRoot.querySelectorAll('[data-parallax-layer]');
    let frame;

    parallaxRoot.addEventListener('pointermove', (event) => {
      const bounds = parallaxRoot.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layers.forEach((layer) => {
          const strength = Number(layer.dataset.parallaxLayer || 8);
          layer.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        });
      });
    });

    parallaxRoot.addEventListener('pointerleave', () => {
      layers.forEach((layer) => { layer.style.transform = ''; });
    });
  }

  // Keep active navigation context in sync with the section in view
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          link.toggleAttribute('aria-current', isCurrent);
        });
      });
    }, { rootMargin: '-40% 0px -50%', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Service detail dialog — turns each service card into a useful capability brief
  const serviceContent = {
    aws: {
      index: '01', title: 'AWS Cloud', interest: 'AWS Cloud',
      description: 'Secure AWS foundations designed around how your organisation builds, operates and governs technology.',
      deliverables: ['Current-state architecture assessment', 'Landing zone and account structure', 'Network, identity and security design', 'Reference architecture and delivery roadmap'],
      outcomes: ['A scalable cloud foundation', 'Clearer ownership and guardrails', 'Lower operational risk', 'Faster, repeatable environment delivery'],
      fit: 'New AWS environments, platform rebuilds and scaling teams'
    },
    migration: {
      index: '02', title: 'Migration & Modernisation', interest: 'Migration & Modernisation',
      description: 'A risk-managed path from legacy infrastructure to modern AWS services, with business continuity built into the plan.',
      deliverables: ['Application and dependency discovery', 'Migration wave planning', 'Target-state architecture', 'Cutover, validation and modernisation plan'],
      outcomes: ['Reduced legacy constraints', 'Controlled migration risk', 'Improved platform resilience', 'A foundation for ongoing modernisation'],
      fit: 'Data centre exits, legacy platforms and cloud consolidation'
    },
    devops: {
      index: '03', title: 'DevOps & Automation', interest: 'DevOps & Automation',
      description: 'Delivery platforms and operating practices that make safe software releases faster, repeatable and observable.',
      deliverables: ['CI/CD pipeline design and implementation', 'Infrastructure as Code modules', 'Environment and release automation', 'Monitoring, alerting and runbooks'],
      outcomes: ['Shorter lead time for change', 'Fewer manual deployment steps', 'Consistent environments', 'Faster incident diagnosis and recovery'],
      fit: 'Teams slowed down by manual delivery or inconsistent environments'
    },
    optimisation: {
      index: '04', title: 'Cloud Optimisation', interest: 'Cloud Optimisation',
      description: 'Evidence-led improvement across AWS cost, performance, reliability, security and operational effectiveness.',
      deliverables: ['Cost and usage analysis', 'Well-Architected workload review', 'Rightsizing and commitment modelling', 'Prioritised optimisation backlog'],
      outcomes: ['Reduced avoidable AWS spend', 'Better workload reliability', 'Clear cost accountability', 'An actionable improvement plan'],
      fit: 'Established AWS estates with rising cost or reliability pressure'
    },
    data: {
      index: '05', title: 'Data & AI', interest: 'Data & AI',
      description: 'Modern data foundations that give analytics and AI products reliable, governed and accessible context.',
      deliverables: ['Data platform architecture', 'Ingestion and transformation pipelines', 'Data quality and governance controls', 'Analytics and AI-ready interfaces'],
      outcomes: ['More reliable business data', 'Faster access to insight', 'Governed AI-ready datasets', 'Less pipeline maintenance overhead'],
      fit: 'Organisations unifying fragmented data for analytics and AI'
    },
    'generative-ai': {
      index: '06', title: 'Generative AI', interest: 'Generative AI',
      description: 'Practical AI applications engineered with evaluation, security, observability and human oversight from the start.',
      deliverables: ['Use-case and feasibility assessment', 'Production application or agent', 'Retrieval and system integrations', 'Evaluation, guardrails and operating model'],
      outcomes: ['A validated business use case', 'Secure production deployment', 'Measurable quality and performance', 'A clear path beyond the prototype'],
      fit: 'Teams moving a valuable AI idea into secure production'
    }
  };

  const serviceDialog = document.querySelector('#service-dialog');
  let selectedService = null;

  const closeServiceDialog = () => {
    if (!serviceDialog) return;
    if (typeof serviceDialog.close === 'function') serviceDialog.close();
    else serviceDialog.removeAttribute('open');
    document.body.classList.remove('menu-open');
  };

  document.querySelectorAll('[data-service]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const service = serviceContent[trigger.dataset.service];
      if (!serviceDialog || !service) return;
      selectedService = service;
      serviceDialog.querySelector('[data-dialog-index]').textContent = service.index;
      serviceDialog.querySelector('[data-dialog-title]').textContent = service.title;
      serviceDialog.querySelector('[data-dialog-description]').textContent = service.description;
      serviceDialog.querySelector('[data-dialog-fit]').textContent = service.fit;

      const fillList = (selector, items) => {
        const list = serviceDialog.querySelector(selector);
        list.replaceChildren(...items.map((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          return li;
        }));
      };
      fillList('[data-dialog-deliverables]', service.deliverables);
      fillList('[data-dialog-outcomes]', service.outcomes);

      if (typeof serviceDialog.showModal === 'function') serviceDialog.showModal();
      else serviceDialog.setAttribute('open', '');
      document.body.classList.add('menu-open');
    });
  });

  serviceDialog?.querySelector('[data-dialog-close]')?.addEventListener('click', closeServiceDialog);
  serviceDialog?.addEventListener('close', () => document.body.classList.remove('menu-open'));
  serviceDialog?.addEventListener('click', (event) => {
    if (event.target === serviceDialog) closeServiceDialog();
  });
  serviceDialog?.querySelector('[data-dialog-contact]')?.addEventListener('click', () => {
    const intent = selectedService?.interest || 'General consultation';
    closeServiceDialog();
    const interest = document.querySelector('[data-interest-select]');
    if (interest) interest.value = intent;
    document.querySelector('#contact')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    window.setTimeout(() => document.querySelector('#contact-form input[name="name"]')?.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 700);
  });

  // Carry the context of every consultation CTA into the enquiry form
  document.addEventListener('click', (event) => {
    const intentLink = event.target.closest('[data-contact-intent]');
    if (!intentLink) return;
    const interest = document.querySelector('[data-interest-select]');
    if (interest) interest.value = intentLink.dataset.contactIntent;
  });

  // AWS health snapshot calculator
  const assessment = document.querySelector('#aws-assessment');
  const assessmentResult = document.querySelector('[data-assessment-result]');
  const assessmentGroups = ['infrastructure', 'delivery', 'observability', 'cost', 'resilience'];

  const updateAssessmentProgress = () => {
    const completed = assessmentGroups.filter((name) => assessment?.querySelector(`input[name="${name}"]:checked`)).length;
    const progress = document.querySelector('[data-assessment-progress]');
    if (progress) progress.textContent = completed;
  };

  assessment?.addEventListener('change', updateAssessmentProgress);
  assessment?.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = assessmentGroups.map((name) => assessment.querySelector(`input[name="${name}"]:checked`));
    const error = assessment.querySelector('[data-assessment-error]');
    if (answers.some((answer) => !answer)) {
      error.textContent = 'Please answer all five questions to calculate your snapshot.';
      const unansweredIndex = answers.findIndex((answer) => !answer);
      assessment.querySelector(`input[name="${assessmentGroups[unansweredIndex]}"]`)?.focus();
      return;
    }

    error.textContent = '';
    const total = answers.reduce((sum, answer) => sum + Number(answer.value), 0);
    const score = Math.round(((total - 5) / 10) * 100);
    const result = score < 40 ? {
      label: 'Foundation stage', title: 'Strengthen the fundamentals first',
      text: 'Your environment has clear opportunities to reduce operational risk and manual effort before scaling further.',
      actions: ['Standardise your AWS account and identity foundations', 'Prioritise Infrastructure as Code and deployment automation', 'Establish cost ownership and baseline observability']
    } : score < 75 ? {
      label: 'Progressing stage', title: 'A solid base with targeted gaps',
      text: 'Core practices are emerging. Focused improvements can make delivery more predictable and the platform easier to operate.',
      actions: ['Close the largest automation and observability gaps', 'Test resilience for business-critical workloads', 'Introduce regular cost and architecture reviews']
    } : {
      label: 'Scaling stage', title: 'Ready to optimise at scale',
      text: 'Your foundations appear mature. The next opportunity is to systematise optimisation and enable teams with reusable platform capabilities.',
      actions: ['Measure platform outcomes and developer experience', 'Automate continuous compliance and cost controls', 'Validate architecture through regular game days and reviews']
    };

    document.querySelector('[data-score]').textContent = score;
    document.querySelector('[data-score-ring]').style.setProperty('--score', `${score * 3.6}deg`);
    document.querySelector('[data-result-label]').textContent = result.label;
    document.querySelector('[data-result-title]').textContent = result.title;
    document.querySelector('[data-result-text]').textContent = result.text;
    const actions = document.querySelector('[data-result-actions]');
    actions.replaceChildren(...result.actions.map((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    assessment.hidden = true;
    assessmentResult.hidden = false;
    assessmentResult.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  });

  document.querySelector('[data-assessment-reset]')?.addEventListener('click', () => {
    assessment?.reset();
    updateAssessmentProgress();
    assessmentResult.hidden = true;
    assessment.hidden = false;
    assessment.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  });

  // Validated contact workflow with a transparent, privacy-safe mail handoff
  const contactForm = document.querySelector('#contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = [...contactForm.querySelectorAll('input, select, textarea')];
    fields.forEach((field) => {
      if (field.checkValidity()) field.removeAttribute('aria-invalid');
      else field.setAttribute('aria-invalid', 'true');
    });
    const firstInvalid = fields.find((field) => !field.checkValidity());
    const error = contactForm.querySelector('[data-form-error]');

    if (firstInvalid) {
      error.textContent = firstInvalid.name === 'message' && firstInvalid.value.length > 0
        ? 'Please provide at least 20 characters about the outcome you need.'
        : 'Please complete all required fields before preparing the enquiry.';
      firstInvalid.focus();
      return;
    }

    error.textContent = '';
    const data = new FormData(contactForm);
    const subject = `Project enquiry — ${data.get('interest')} — ${data.get('organisation') || data.get('name')}`;
    const body = [
      `Name: ${data.get('name')}`,
      `Work email: ${data.get('email')}`,
      `Organisation: ${data.get('organisation') || 'Not provided'}`,
      `Area of interest: ${data.get('interest')}`,
      `Preferred timeframe: ${data.get('timeframe')}`,
      `Indicative project size: ${data.get('budget')}`,
      '',
      'What we are trying to achieve:',
      data.get('message')
    ].join('\n');

    contactForm.querySelector('[data-form-success]').hidden = false;
    window.location.href = `mailto:hello@dunaduna.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  contactForm?.addEventListener('input', (event) => {
    if (event.target.matches('input, select, textarea') && event.target.checkValidity()) {
      event.target.removeAttribute('aria-invalid');
    }
  });
})();

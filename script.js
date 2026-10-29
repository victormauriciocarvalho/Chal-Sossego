/* ==========================================================
   Chalé Sossego — script.js
   Compartilhado por todas as páginas (index, casas/* e 404).
   Cada bloco só roda se os elementos existirem na página.
   ========================================================== */
(function () {
  'use strict';

  var header = document.querySelector('header');

  /* ---------- 1. Animação de entrada ao rolar (.reveal / .reveal-scale) ---------- */
  (function () {
    var alvos = document.querySelectorAll('.reveal, .reveal-scale');
    if (!alvos.length) return;
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('is-visible');
            obs.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      alvos.forEach(function (el) { obs.observe(el); });
    } else {
      alvos.forEach(function (el) { el.classList.add('is-visible'); });
    }
  })();

  /* ---------- 2. Sombra no header ao rolar ---------- */
  (function () {
    if (!header) return;
    function atualizar() { header.classList.toggle('is-scrolled', window.scrollY > 12); }
    window.addEventListener('scroll', atualizar, { passive: true });
    atualizar();
  })();

  /* ---------- 3. Menu hambúrguer (mobile) ---------- */
  (function () {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!header || !toggle || !links) return;

    function definir(aberto) {
      header.classList.toggle('nav-open', aberto);
      toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    }
    toggle.addEventListener('click', function () {
      definir(!header.classList.contains('nav-open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { definir(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        definir(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) definir(false);
    });
  })();

  /* ---------- 4. Seletor de acomodação (home) ---------- */
  (function () {
    var select = document.getElementById('escolha-casa');
    var botao = document.getElementById('ver-casa');
    if (!select || !botao) return;

    select.addEventListener('change', function () {
      select.style.borderColor = '';
      select.removeAttribute('aria-invalid');
    });
    botao.addEventListener('click', function () {
      if (!select.value) {
        select.style.borderColor = '#e07a5f';
        select.setAttribute('aria-invalid', 'true');
        select.focus();
        return;
      }
      window.location.href = select.value;
    });
  })();

  /* ---------- 5. Galeria + lightbox (páginas das casas) ---------- */
  (function () {
    var lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox) return;

    var imgEl = lightbox.querySelector('[data-lb-img]');
    var contador = lightbox.querySelector('[data-lb-contador]');
    var btnFechar = lightbox.querySelector('[data-lb-fechar]');
    var btnAnterior = lightbox.querySelector('[data-lb-anterior]');
    var btnProxima = lightbox.querySelector('[data-lb-proxima]');
    var fotos = Array.prototype.slice.call(document.querySelectorAll('.galeria-foto'));
    var indiceAtual = 0;
    var focoAnterior = null;

    function atualizar() {
      var foto = fotos[indiceAtual];
      imgEl.src = foto.currentSrc || foto.src;
      imgEl.alt = foto.alt;
      contador.textContent = (indiceAtual + 1) + ' / ' + fotos.length;
    }
    function abrir(indice) {
      focoAnterior = document.activeElement;
      indiceAtual = indice;
      atualizar();
      lightbox.classList.add('is-aberto');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      btnFechar.focus();
    }
    function fechar() {
      lightbox.classList.remove('is-aberto');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (focoAnterior && typeof focoAnterior.focus === 'function') focoAnterior.focus();
    }
    function mudar(direcao) {
      indiceAtual = (indiceAtual + direcao + fotos.length) % fotos.length;
      atualizar();
    }

    // Cada foto abre o lightbox (mouse, toque e teclado)
    fotos.forEach(function (foto, i) {
      foto.setAttribute('tabindex', '0');
      foto.setAttribute('role', 'button');
      foto.addEventListener('click', function () { abrir(i); });
      foto.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); }
      });
    });

    // Esconde subdivisões (área externa / interna / quarto) sem fotos
    Array.prototype.forEach.call(document.querySelectorAll('.galeria-grupo'), function (g) {
      g.hidden = !g.querySelector('.galeria-foto');
    });

    // Botão "Ver todas as fotos": expande/recolhe a galeria
    var grid = document.querySelector('[data-galeria]');
    var extra = grid ? grid.querySelector('.galeria-extra') : null;
    var btnVerTodas = document.querySelector('[data-ver-todas]');
    var btnLabel = btnVerTodas ? btnVerTodas.querySelector('[data-ver-todas-label]') : null;
    if (btnVerTodas && grid && extra) {
      btnVerTodas.setAttribute('aria-expanded', 'false');

      // Guarda a proporção real de cada foto extra (vertical ou horizontal)
      Array.prototype.forEach.call(extra.querySelectorAll('.galeria-foto'), function (img) {
        function ajustar() {
          if (img.naturalWidth && img.naturalHeight) {
            img.style.setProperty('--r', (img.naturalWidth / img.naturalHeight).toFixed(4));
          }
        }
        if (img.complete) ajustar();
        img.addEventListener('load', ajustar);
      });

      btnVerTodas.addEventListener('click', function (e) {
        e.stopPropagation();
        var expandir = !grid.classList.contains('is-expandida');
        grid.classList.toggle('is-expandida', expandir);
        extra.hidden = !expandir;
        if (expandir) {
          // carrega tudo de uma vez para as proporções se ajustarem
          Array.prototype.forEach.call(extra.querySelectorAll('img[loading="lazy"]'), function (img) {
            img.loading = 'eager';
          });
        }
        btnVerTodas.setAttribute('aria-expanded', expandir ? 'true' : 'false');
        if (btnLabel) btnLabel.textContent = expandir ? 'Ver menos fotos' : 'Ver todas as fotos';
        if (!expandir) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    btnFechar.addEventListener('click', fechar);
    btnAnterior.addEventListener('click', function () { mudar(-1); });
    btnProxima.addEventListener('click', function () { mudar(1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) fechar();
    });

    // Deslizar o dedo: esquerda = próxima foto, direita = anterior
    var toqueX = null, toqueY = null, multitoque = false;
    lightbox.addEventListener('touchstart', function (e) {
      multitoque = e.touches.length > 1;
      if (multitoque) { toqueX = null; return; }
      toqueX = e.touches[0].clientX;
      toqueY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (toqueX === null || multitoque) { toqueX = null; return; }
      var dx = e.changedTouches[0].clientX - toqueX;
      var dy = e.changedTouches[0].clientY - toqueY;
      toqueX = null;
      // só conta se foi mais horizontal que vertical e passou de 50px
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      mudar(dx < 0 ? 1 : -1);
    }, { passive: true });

    // Teclado: Esc fecha, setas navegam, Tab fica preso dentro do lightbox
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-aberto')) return;
      if (e.key === 'Escape') { fechar(); return; }
      if (e.key === 'ArrowLeft') { mudar(-1); return; }
      if (e.key === 'ArrowRight') { mudar(1); return; }
      if (e.key === 'Tab') {
        var ordem = [btnAnterior, btnFechar, btnProxima];
        var i = ordem.indexOf(document.activeElement);
        if (i === -1) { e.preventDefault(); btnFechar.focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); ordem[ordem.length - 1].focus(); }
        else if (!e.shiftKey && i === ordem.length - 1) { e.preventDefault(); ordem[0].focus(); }
      }
    });
  })();
})();

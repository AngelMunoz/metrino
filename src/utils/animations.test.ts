import { assert } from "chai";
import { extractAnimationRules } from "./animations.ts";

suite("extractAnimationRules", () => {
  const source = `
    /* a leading comment with a brace { inside */
    @keyframes metro-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .metro-animate-fade-in {
      animation: metro-fade-in 167ms var(--metro-easing) forwards;
    }

    .page-title {
      font-size: 42px;
    }

    @media (prefers-reduced-motion: reduce) {
      .metro-animate-slide-up {
        animation: none;
      }

      @keyframes metro-slide-up {
        from {
          transform: translateY(40px);
        }
        to {
          transform: translateY(0);
        }
      }
    }

    .metro-entrance-stagger > * {
      animation: metro-entrance-stagger 250ms forwards;
    }
  `;

  test("collects every keyframes block, braces and all", () => {
    const { keyframes } = extractAnimationRules(source);

    assert.include(keyframes, "@keyframes metro-fade-in {");
    assert.include(keyframes, "from { opacity: 0; }");
    assert.include(keyframes, "@keyframes metro-slide-up {");
    assert.include(keyframes, "transform: translateY(40px);");
    assert.notInclude(keyframes, "metro-entrance-stagger");
    assert.notInclude(keyframes, "font-size");
  });

  test("collects the animate classes and nothing else", () => {
    const { classes } = extractAnimationRules(source);

    assert.include(classes, ".metro-animate-fade-in {");
    assert.include(classes, ".metro-animate-slide-up {");
    assert.notInclude(classes, ".page-title");
    assert.notInclude(classes, ".metro-entrance-stagger");
  });

  test("drops comments", () => {
    const { keyframes, classes } = extractAnimationRules(source);

    assert.notInclude(keyframes + classes, "a leading comment");
  });

  test("keeps the two groups apart", () => {
    const { keyframes, classes } = extractAnimationRules(source);

    assert.equal(keyframes.indexOf(".metro-animate-fade-in"), -1);
    assert.equal(classes.indexOf("@keyframes"), -1);
  });

  test("handles an empty stylesheet", () => {
    assert.deepEqual(extractAnimationRules(""), { keyframes: "", classes: "" });
  });
});

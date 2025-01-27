export type AiToHtmlBoard = {
  htmlBlock: string;
  rawAttributes: {
    "data-min-width"?: string;
    "data-max-width"?: string;
  };
};

export type AiToHtmlProps = {
  /**
   * Array de URLs JSON que contienen los datos para renderizar.
   */
  jsonUrls: string[];

  /**
   * Índice activo para determinar qué datos mostrar.
   */
  activeIndex: number;

};

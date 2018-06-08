//该类提供了canvas到webgl的转换方法，包括颜色转换与坐标转换
class Transfer {
    //颜色转换，如[255,0,0]->[1,0,0]
    static color_transfer(color) {
        return [color[0] / 255, color[1] / 255, color[2] / 255];
    }
    //坐标转换，如[350,100,0]->[(350*2/width-width)*scale, (100*2/height-height)*scale]
    static vertex_transfer(vertex, width, height, scale) {
        return [(vertex[0] * 2 / width - 1)*scale, (-vertex[1] * 2 / height + 1)*scale];
    }
    //涂色三角形时，转换坐标（需要转换颜色）
    static triangle_transfer(vertex_list, color_list, width, height, scale) {
        if (vertex_list.length !== 3 || color_list.length !== 3) {
            return;
        }
        let result_list = [];
        for (let i = 0; i < 3; i++) {
            result_list = result_list.concat(this.vertex_transfer(vertex_list[i], width, height, scale)).concat(this.color_transfer(color_list[i]));
        }
        return result_list;
    }
    //描绘三角形边框时，转换坐标（不需要转换颜色）
    static triangle_line_transfer(vertex_list, width, height, scale) {
        if (vertex_list.length !== 3) {
            return;
        }
        let result_list = [];
        for (let i = 0; i < 3; i++) {
            result_list = result_list.concat(this.vertex_transfer(vertex_list[i], width, height, scale));
        }
        return result_list;
    }
}

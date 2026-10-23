import { useEffect, useState } from 'react';
import { configs } from '../../api/services';
import './watermark.scss';

/**
 * Водяной знак бесплатного доступа. Показывается, когда сервер прислал
 * hud_config.watermark = true (бесплатный тариф). Движется по кадру —
 * вырезать его кадрированием одной области нельзя.
 */
const Watermark = () => {
    // Если знак смонтировался позже прихода hud_config — берём уже сохранённое
    // значение; по умолчанию показываем (сервер выключит для платных тарифов).
    const [show, setShow] = useState<boolean>(configs.data?.watermark ?? true);

    useEffect(() => {
        const onChange = (data: { watermark?: boolean }) => {
            if (data?.watermark !== undefined) setShow(data.watermark);
        };
        configs.onChange(onChange);
        onChange(configs.data); // текущее значение сразу
    }, []);

    if (!show) return null;

    return (
        <div className="dota-watermark">
            <div className="dota-watermark-label">Бесплатный доступ</div>
            <div className="dota-watermark-url">meowhud.ru</div>
        </div>
    );
};

export default Watermark;

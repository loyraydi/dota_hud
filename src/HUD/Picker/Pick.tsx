import React from 'react';
import { DraftEntry, Faction } from 'dotagsi';
import { getAssetURL } from '../../api/api';

interface DraftSlotProps {
    entry: DraftEntry;
    type: Faction;
    active: boolean;
    timeRemaining?: number;
    teamLogoUrl?: string | null;
}

const fmt = (sec: number) => {
    const s = Math.max(0, Math.round(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const DraftSlot = ({ entry, type, active, timeRemaining, teamLogoUrl }: DraftSlotProps) => {
    const isPick = entry.type === 'pick';
    const hasHero = !!entry.class;

    return (
        <div className={[
            'draft_slot', type,
            isPick ? 'pick' : 'ban',
            active  ? 'active'  : '',
            hasHero ? 'filled'  : 'empty',
        ].filter(Boolean).join(' ')}>

            {/* ── Заполненный пик — видео героя ── */}
            {hasHero && isPick && (
                <video
                    className="draft_slot_video"
                    muted autoPlay loop playsInline
                    disablePictureInPicture
                >
                    <source src={getAssetURL(entry.class!, 'draft_animated')} type="video/webm" />
                </video>
            )}

            {/* ── Заполненный бан — ч/б видео ──
                 Проигрывается один раз и замирает на последнем кадре (= первому, ролик
                 зациклен): 14 банов × бесконечный VP9 + grayscale-фильтр на каждом кадре
                 давали половину нагрузки драфта. */}
            {hasHero && !isPick && (
                <>
                    <video
                        className="draft_slot_ban_video"
                        muted autoPlay playsInline
                        disablePictureInPicture
                    >
                        <source
                            src={getAssetURL(entry.class!, 'heroes_animated')}
                            type="video/webm"
                        />
                    </video>
                    <div className="draft_slot_ban_cross">✕</div>
                </>
            )}

            {/* ── Пустой бан (неактивный) — просто крест ── */}
            {!hasHero && !isPick && !active && (
                <div className="draft_slot_empty_ban">✕</div>
            )}

            {/* ── Пустой пик — логотип команды ч/б ── */}
            {!hasHero && isPick && !active && (
                <div className="draft_slot_empty_pick">
                    {teamLogoUrl
                        ? <img src={teamLogoUrl} alt="" className="draft_slot_team_logo" />
                        : <span className="draft_slot_team_logo_fallback">—</span>
                    }
                </div>
            )}

            {/* ── Активная карточка — тип + таймер ── */}
            {active && !hasHero && timeRemaining !== undefined && (
                <div className="draft_slot_active_timer">
                    <span className="draft_slot_active_type">{isPick ? 'PICK' : 'BAN'}</span>
                    <span className="draft_slot_active_time">{fmt(timeRemaining)}</span>
                </div>
            )}
        </div>
    );
};

// entry — новый объект на каждом тике GSI; слот перерисовывается только при реальной смене
export default React.memo(DraftSlot, (a, b) =>
    a.entry.class === b.entry.class && a.entry.type === b.entry.type && a.entry.order === b.entry.order &&
    a.type === b.type && a.active === b.active && a.teamLogoUrl === b.teamLogoUrl &&
    (a.timeRemaining === undefined ? b.timeRemaining === undefined
        : b.timeRemaining !== undefined && Math.round(a.timeRemaining) === Math.round(b.timeRemaining))
);